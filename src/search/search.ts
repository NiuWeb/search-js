/** Search item can be strings, numbers or array of these */
export type SearchItem = undefined | number | string | SearchItem[]

export interface SearchProps<Value> {
    /** Values to search in */
    values: Value[]
    /** Search criteria */
    search: SearchItem
    /** 
     * whether to match with at least one of the search criteria (some) 
     * or with all of the search criteria (every). Default is "some"
     */
    mode?: "some" | "every"
    /** A function that maps an input value into a comparable search item */
    map(value: Value): SearchItem

    /** for strings only: case insensitive */
    ignoreCase?: boolean
    /** for strings only: 
     * whether to search for exact match (true) 
     * or substring (false)
     * */
    exact?: boolean
}

export interface SearchResult<Value> {
    /** List of found values */
    values: Value[]
    /** List of the indexes of the found values */
    indexes: number[]
    /** List of pairs {index, value} of the found values */
    results: { index: number, value: Value }[]
}

/**
 * Convers a search item (which can be string, number, undefined or array of those values)
 * into a single set of string|number
 */
export function ReduceSearchItem(item: SearchItem): (string | number)[] {
    const set: (string | number)[] = []
    if (item === undefined) {
        return set
    }
    if (Array.isArray(item)) {
        for (const value of item) {
            const values = ReduceSearchItem(value)
            for (const value of values) {
                set.push(value)
            }
        }
    } else {
        set.push(item)
    }
    return set
}

// export function CompareSet(first: Set<string | number>, second: ) { }

/**
 * Search matches in a list of values
 */
export function Search<Value>(props: SearchProps<Value>): SearchResult<Value> {
    const search = ReduceSearchItem(props.search)
    const result: SearchResult<Value> = {
        values: [],
        indexes: [],
        results: []
    }
    const mode = props.mode || "some"
    for (let i = 0; i < props.values.length; i++) {
        const target = ReduceSearchItem(props.map(props.values[i]))
        const some = search[mode](want => target.some(got => {
            if (typeof want !== typeof got) {
                return false
            }
            if (props.ignoreCase) {
                if (typeof want === "string") {
                    want = want.toLowerCase()
                }
                if (typeof got === "string") {
                    got = got.toLowerCase()
                }
            }
            if (props.exact || typeof want === "number") {
                return want === got
            }
            if (typeof got === "string") {
                return got.includes(want)
            }
            return false
        }))
        if (some) {
            result.values.push(props.values[i])
            result.indexes.push(i)
            result.results.push({ value: props.values[i], index: i })
        }
    }
    return result
}