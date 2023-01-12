import esbuild from "esbuild"
import nodeExternalsPlugin from "esbuild-node-externals"
import klawSync from "klaw-sync"
import rimraf from "rimraf"
import { exec } from "child_process"
const args = process.argv.slice(2)
const watch = args.includes("watch")
const root = process.cwd() + "/lib"

const lib = klawSync(root)
lib.forEach(({ path }) => {
    if (!path.endsWith("package.json")) {
        rimraf.sync(path)
    }
})
console.log("RUNNING ESBUILD")
esbuild.build({
    entryPoints: ["src/index.ts"],
    outdir: "lib",
    format: "esm",
    bundle: true,
    sourcemap: "external",
    plugins: [nodeExternalsPlugin({
        allowList: [
            "@bygdle/javascript-lp-solver"
        ]
    })],
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

console.log("RUNNING TYPESCRIPT COMPILER")
const cmd = "npx tsc --declaration --emitDeclarationOnly --project tsconfig.build.json"

const stream = exec(cmd + (watch ? " --watch" : ""))

stream.on("error", (out) => { throw out })
stream.on("close", () => console.log("Done!"))

stream.stdout?.on("data", out => console.log(out.toString()))
stream.stderr?.on("data", out => console.error(out.toString()))