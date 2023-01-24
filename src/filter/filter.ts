export interface Filter<Value> {
    /** 
     * if defined, the filter will be applied ONLY to the 
     * values that passes this function. If not, 
     * they will pass the filter.
     * A value "passes" if the function returns true.
     */
    for?(value: Value): boolean

    /**
     * Apples to all input values; returns true if the
     * value should pass the filter.
     */
    filter(value: Value): boolean
}

export interface FilterProps<Value> {
    /** Values to filter */
    values: readonly Value[]
    /** Filter to apply */
    filters: readonly Filter<Value>[]
    /** 
     * whether to match with at least one of the filters (some) 
     * or with all of the filters (every). Default is "some"
     */
    mode?: "some" | "every"
}

export interface FilterResult<Value> {
    /** List of filtered values */
    values: Value[]
    /** List of the indexes of the filtered values */
    indexes: number[]
    /** List of pairs {index, value} of the filtered values */
    results: { index: number, value: Value }[]
}
/**
 * Filters a list of values
 */
export function Filter<Value>(props: FilterProps<Value>): FilterResult<Value> {
    const result: FilterResult<Value> = {
        values: [],
        indexes: [],
        results: []
    }

    props.values.forEach((value, i) => {
        const pass = props.filters[props.mode || "some"](filter => {
            if (!filter.for) {
                return filter.filter(value)
            } else if (filter.for(value)) {
                return filter.filter(value)
            } else {
                return true
            }
        })
        if (pass) {
            result.values.push(value)
            result.indexes.push(i)
            result.results.push({ value, index: i })
        }
    })

    return result
}