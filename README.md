## search-js
Simple function to search in arrays. Usage example:
```ts
import { search } from "@bygdle/search-js"
// an array of objects of any type
const data = [
  { name: "A" },
  { name: "B" },
  { name: "C" },
  { name: "A-a" },
  { name: "A*B" },
]
// search objects with exact name "B"
const { values } = search.Search({
    values: data,
    search: "B",
    map: v => v.name,
    exact: true
})
console.log(values[0] === data[1]) // true
```