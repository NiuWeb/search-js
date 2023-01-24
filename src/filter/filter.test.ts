import { Filter } from "./filter"

const data = [
    { main: { s: 32, v: 11 }, subs: [{ s: 1, v: 2 }, { s: 2, v: 4 }] },
    { main: { s: 32, v: 11 }, subs: [{ s: 18, v: 352 }, { s: 2, v: 4 }] },
    { main: { s: 27, v: 99 }, subs: [{ s: 18, v: 352 }, { s: 2, v: 1 }] },
    { main: { s: 64, v: 2 }, subs: [{ s: 2, v: 14 }, { s: 5, v: 1 }] },
]

describe("Apply filter only to values of a given type", () => {
    const { indexes } = Filter({
        values: data,
        filters: [
            {
                for: piece => (
                    piece.main.s === 32 // the pieces with main of type 32
                ),
                filter: piece => (
                    piece.subs.some(sub => sub.s === 18) // should have at least one sub of type 18
                )
            }
        ]
    })

    test("Results should be indexes 1, 2, 3. Value at index 0 has a filter applied", () => (
        expect(new Set(indexes)).toEqual(new Set([1, 2, 3]))
    ))
})


describe("Apply a two filter with mode SOME to all values", () => {
    const { indexes } = Filter({
        values: data,
        filters: [
            {
                filter: piece => (
                    piece.subs.some(sub => sub.s === 1)
                )
            },
            {
                filter: piece => (
                    piece.subs.some(sub => sub.s === 5)
                )
            },
        ]
    })
    test("Results should be indexes 0, 3.", () => (
        expect(new Set(indexes)).toEqual(new Set([0, 3]))
    ))
})


describe("Apply a two filter with mode EVERY to all values", () => {
    const { indexes } = Filter({
        values: data,
        mode: "every",
        filters: [
            {
                filter: piece => (
                    piece.subs.some(sub => sub.s === 1)
                )
            },
            {
                filter: piece => (
                    piece.subs.some(sub => sub.s === 5)
                )
            },
        ]
    })
    test("Results should be empty", () => (
        expect(new Set(indexes)).toEqual(new Set([]))
    ))
})