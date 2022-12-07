import { spawn } from "child_process"
import depcheck from "depcheck"
import fs from "fs"
import klawSync from "klaw-sync"
import rimraf from "rimraf"
import esbuild from "esbuild"
import nodeExternalsPlugin from "esbuild-node-externals"

const args = process.argv.slice(2)
const watch = args.includes("watch")

const ROOT_PATH = process.cwd()
const PACKAGE_JSON = ROOT_PATH + "/package.json"
const LIB_PATH = ROOT_PATH + "/lib"

/**
 * Builds the library
 */
async function build() {
    console.log(`==== BUILDING MODULE ${watch ? "(watch)" : ""}====`)

    // Get the unused dependencies
    console.log("(1/4) Scanning dependencies")
    const check = await depcheck(ROOT_PATH, {
        specials: [
            depcheck.special.ttypescript
        ],
        ignorePatterns: [
            "*build.ts",
            "*tsconfig.json"
        ]
    })
    const deps = [...check.dependencies, ...check.devDependencies]

    // Get the package.json
    console.log("(2/4) Generating package.json")
    const pkg = fs.readFileSync(PACKAGE_JSON)
    const pkgjson = JSON.parse(pkg.toString("utf-8"))

    // Remove dev and unused dependencies
    delete pkgjson.scripts
    delete pkgjson.devDependencies
    pkgjson.main = "./index.js"
    pkgjson.type = "module"

    const depKeys = Object.keys(pkgjson.dependencies)
    depKeys.forEach(key => {
        if (deps.includes(key)) {
            delete pkgjson.dependencies[key]
        }
    })

    // Write the package
    fs.mkdirSync(LIB_PATH, { recursive: true })
    fs.writeFileSync(LIB_PATH + "/package.json", JSON.stringify(pkgjson, null, 2))

    // Clear lib directory and build typescript
    console.log("(3/4) Clearing build directory")

    const lib = klawSync(LIB_PATH)
    lib.forEach(({ path }) => {
        if (!path.endsWith("package.json")) {
            rimraf.sync(path)
        }
    })

    console.log("(4/4) Building")

    esbuild.build({
        entryPoints: ["src/index.ts"],
        outdir: "lib",
        format: "esm",
        bundle: true,
        plugins: [nodeExternalsPlugin()],
        watch: !watch ? undefined : {
            onRebuild(error, result) {
                if (error) {
                    console.error("[ESBUILD ERROR]", error)
                }
                if (result) {
                    console.log("[ESBUILD]", result)
                }
            },
        }
    })

    const args = ["ttsc", "--declaration", "--emitDeclarationOnly", "--project", "tsconfig.build.json"]
    if (watch)
        args.push("--watch")
    const stream = spawn("npx", args, { cwd: ROOT_PATH })

    stream.stdout.on("data", out => console.log(out.toString()))
    stream.stderr.on("data", out => console.error(out.toString()))

    stream.on("error", (out) => { throw out })
    stream.on("close", () => console.log("Done!"))
}

build()