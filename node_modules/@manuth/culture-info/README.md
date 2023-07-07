# CultureInfo.js
A node-package for representing locales

## General
This package allows you to easily represent locales and determining the next lesser-specific parent of a locale (`en-US` => `en`).

This key feature might be usable for creating a resource-manager or showing web-content based on a language-tag consisting of the language, the script and the region.

## Creating a `CultureInfo` instance
You can create a `CultureInfo` instance by passing a language-tag to its constructor:

```ts
import { CultureInfo } from "@manuth/culture-info";

let culture = new CultureInfo("en-US");
```

Following kinds of language-tags are supported:
  - Language  
    Example: `en`
  - Language and region  
    Example: `en-US`
  - Language, script and region  
    Example: `zh-Hans-CN`

## Features
### Automated Casing
The casing is automatically adjusted allowing you to pass the language-tag even with incorrect letter-casing:

```ts
console.log(new CultureInfo("EN-US").Name); // Logs `"en-US"`
console.log(new CultureInfo("zH-hANs-cN").Name); // Logs `"zh-Hans-CN"`
```

Checking whether a culture only consists of a language:
```ts
console.log(new CultureInfo("en").IsNeutralCulture); // Logs `true`
console.log(new CultureInfo("en-US").IsNeutralCulture); // Logs `false`
```

### Walking up the Locale-Graph
You might want to find out the next lesser specific locale of a specific language-tag.
This can be achieved using the `Parent`-property:

```ts
let culture = new CultureInfo("en-US");
console.log(culture.Name); // Logs `"en-US"`
culture = culture.Parent;
console.log(culture.Name); // Logs `"en"`
culture = culture.Parent;
console.log(culture.Name); // Logs `""` - That's the invariant culture
```

### String Conversion
When converting a `CultureInfo` to a string it's automatically converted to the language-tag:

```ts
console.log(`${new CultureInfo("en-US")}`); // Logs `"en-US"`
```
