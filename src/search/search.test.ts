import { ReduceSearchItem, Search, SearchItem } from "./search"

describe("Search utilities", () => {
    test("Search arrays are reduced to a single set", () => {
        const input: SearchItem = [
            "A", undefined, "B", ["C", "D", undefined, "E"],
            ["F", ["G", "H"]], 1, [2, undefined, 3]
        ]
        const reduced = new Set(ReduceSearchItem(input))
        const expected = new Set(["A", "B", "C", "D", "E", "F", "G", "H", 1, 2, 3])

        expect(reduced).toEqual(expected)
    })
})

describe("Search function", () => {
    const data = [
        { name: "A" },
        { name: "B" },
        { name: "C" },
        { name: "Aa" },
        { name: "A*B" },
    ]
    test("Search an exact match", () => {
        const { results } = Search({
            values: data,
            search: "A",
            map: v => v.name,
            exact: true
        })
        expect(results.length).toBe(1)
        expect(results[0].value).toBe(data[0])
    })
    test("Search non-exact matches", () => {
        const { results } = Search({
            values: data,
            search: "A",
            map: v => v.name,
            exact: false,
        })
        expect(results.length).toBe(3)
        expect(results[0].value).toBe(data[0])
        expect(results[1].value).toBe(data[3])
        expect(results[2].value).toBe(data[4])
    })

    test("Search for match with all criteria", () => {
        const { results } = Search({
            values: data,
            map: v => v.name,
            mode: "every",
            search: ["A", "B"]
        })
        expect(results.length).toBe(1)
        expect(results[0].value).toBe(data[4])
    })
})