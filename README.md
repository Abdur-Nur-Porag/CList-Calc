 # CList Calc

> **Plugin:** Carbon CList Calc · **Author:** AbdurNurPorag
> **GitHub:** https://github.com/Abdur-Nur-Porag/CList-Calc

---

## Table of Contents

1. [What is CList Calc?](#1-what-is-clist-calc)
2. [Installation](#2-installation)
3. [Two Ways to Use CList Calc](#3-two-ways-to-use-clist-calc)
   - [Syntax A — List Inside the Block](#syntax-a--list-inside-the-block)
   - [Syntax B — List Outside the Block](#syntax-b--list-outside-the-block)
   - [Side-by-Side Comparison](#side-by-side-comparison)
   - [Which One Should I Use?](#which-one-should-i-use)
4. [Your First List in 2 Minutes](#4-your-first-list-in-2-minutes)
5. [Core Concepts](#5-core-concepts)
   - [The Render Block](#51-the-render-block)
   - [List Item Syntax](#52-list-item-syntax)
   - [Checkbox vs Plain Items](#53-checkbox-vs-plain-items)
   - [Inline Unit Suffix](#54-inline-unit-suffix)
   - [Nested Children](#55-nested-children)
   - [Variables & References](#56-variables--references)
6. [Block Directives (Settings)](#6-block-directives-settings)
7. [Row Directives (Per-Line Options)](#7-row-directives-per-line-options)
8. [Math Functions Reference](#8-math-functions-reference)
9. [Aggregation Functions Reference](#9-aggregation-functions-reference)
10. [Path References](#10-path-references)
11. [Examples — Easy to Hard](#11-examples--easy-to-hard)
    - [Example 1 — Simple Shopping List (Easy)](#example-1--simple-shopping-list-easy)
    - [Example 2 — Monthly Budget (Easy–Medium)](#example-2--monthly-budget-easymedium)
    - [Example 3 — Nested Project Cost (Medium)](#example-3--nested-project-cost-medium)
    - [Example 4 — Student Marks & Grade (Medium)](#example-4--student-marks--grade-medium)
    - [Example 5 — Markdown List + Calc Block (Medium)](#example-5--markdown-list--calc-block-medium)
    - [Example 6 — Business Profit & Loss (Medium–Hard)](#example-6--business-profit--loss-mediumhard)
    - [Example 7 — Loan & Interest Calculator (Hard)](#example-7--loan--interest-calculator-hard)
    - [Example 8 — Full Inventory with Themes (Hard)](#example-8--full-inventory-with-themes-hard)
12. [Practice Exercises](#12-practice-exercises)
13. [Tips, Tricks & Common Mistakes](#13-tips-tricks--common-mistakes)
14. [Quick Reference Card](#14-quick-reference-card)

---

## 1. What is CList Calc?

CList Calc is an **Obsidian plugin** that turns your plain markdown lists into **live, calculating tables**. Instead of switching to a spreadsheet for basic math, you write a normal list — add some numbers — and the plugin renders a beautiful table with all the math done automatically.

**What you write (inside the block):**
```
Pen = 10
Notebook = 25
Total = Pen+Notebook
```

**What you see (rendered table):**

| Item     | Value |
|----------|------:|
| Pen      | 10    |
| Notebook | 25    |
| Total    | 35    |

You can do this for budgets, shopping lists, project costs, grades, business reports — anything with numbers. And crucially, **the plugin supports two completely different ways of working** — you can keep your list inside the code block, or write it as a normal Obsidian markdown list and let the block just handle the calculations.

---

## 2. Installation

1. Open Obsidian → **Settings** → **Community Plugins**
2. Turn off **Safe Mode** if asked
3. Click **Browse** and search for `CList Calc`
4. Click **Install**, then **Enable**
5. Done! The plugin is now active.

> **Manual install:** Copy `main.js` and `manifest.json` into `.obsidian/plugins/clist-calc/` inside your vault folder.

---

## 3. Two Ways to Use CList Calc

This is the most important concept in the whole plugin. **CList Calc supports two completely different syntaxes.** Both produce the same kind of table — but they work in very different ways. Understanding this will make everything else click.

---

### Syntax A — List Inside the Block

You write your **entire list inside the `clist-calc` code block**. The block is self-contained — it holds both the data and the display.

> **Rule:** Inside a `clist-calc` block, write rows as `Label = expression` — **no `- [ ]` prefix**. The checkbox prefix belongs in your markdown body (Syntax B), not inside the block.

````markdown
```clist-calc
#title: My Groceries
#currency: BDT

Rice = 120
Oil = 95
Eggs = 70
Total = Rice+Oil+Eggs @bold
```
````

Clean and simple — everything lives in one place.

---

### Syntax B — List Outside the Block

You write your **list anywhere in the note as normal Obsidian markdown**, completely outside the code block. The `clist-calc` block reads the entire file, finds all your list items automatically, and uses them as data. The block itself only contains the **display expressions**.

Here is what your note looks like with Syntax B:

```markdown
## My Shopping Items

This is my shopping list for this week:

- [ ] Rice = 120
- [ ] Oil = 95
- [ ] Eggs = 70

These items are just normal markdown — they render as a checklist in Obsidian.
You can check them off as you shop!
```

Then, anywhere else in the same note, you place the `clist-calc` block:

````markdown
```clist-calc
#title: Shopping Summary
#currency: BDT

Total = Sum(Rice)+Sum(Oil)+Sum(Eggs) @bold
Avg Price = Round2(Avg(Rice,Oil,Eggs)) @note:per item
```
````

The plugin **reads the whole file**, finds `Rice`, `Oil`, and `Eggs` from the markdown list above, and uses their values in the code block.

> **Why `Sum()` instead of just `Rice+Oil+Eggs`?**
> When items are defined as flat markdown list entries (Syntax B), wrapping them in `Sum()` is the safe and explicit way to pull their values. It also handles nested children automatically. For simple single-value references `Rice` works, but `Sum(Rice)` is always reliable.

> **How this works technically:** When Obsidian renders the `clist-calc` block, the plugin reads your entire note file. It scans every `-` list item it finds — inside and outside the block — and builds a data tree from all of them. The block then renders only its own lines as table rows, but can reference any label found anywhere in the file.

---

### Side-by-Side Comparison

| Feature | Syntax A (List Inside Block) | Syntax B (List Outside Block) |
|---|---|---|
| Where is the list? | Inside `clist-calc` block | Anywhere in the note as normal markdown |
| Can I check items off? | Yes (checkboxes work) | Yes — and they look like a real Obsidian checklist |
| Can the list be read by other tools? | No — hidden in a code block | Yes — visible, searchable, linkable in Obsidian |
| Can I mix text and list in the note? | No | Yes — the list lives among your prose |
| Best for | Self-contained calculators | Notes where the list has meaning beyond just numbers |
| Multiple calc blocks on one page? | Yes — each block shows its own rows | Yes — all blocks share the same file-wide data tree |

---

### Which One Should I Use?

**Use Syntax A (inside the block) when:**
- You want a quick, portable calculator
- The list exists *only* for the purpose of calculation
- You are embedding a budget or cost table into a report

**Use Syntax B (outside the block) when:**
- Your list is a real checklist you want to tick off
- You want the items visible in the note body (for reading, searching, linking)
- You want to write prose *around* your list and show a summary table separately
- You have one list that feeds multiple different `clist-calc` blocks on the same page

**You can also mix both freely.** Some items can be defined in the markdown body, and others can be defined inside the block — the plugin merges them all into one data tree.

---

## 4. Your First List in 2 Minutes

### Try Syntax A first

In any Obsidian note, create a `clist-calc` block:

````markdown
```clist-calc
Apples = 5
Oranges = 3
Total = Apples+Oranges
```
````

Switch to **Reading View** (or use Live Preview) — you will see:

| Item    | Value |
|---------|------:|
| Apples  | 5     |
| Oranges | 3     |
| Total   | 8     |

### Now try Syntax B

Write this anywhere in the same note, **outside** any code block:

```markdown
- [ ] Bananas = 4
- [ ] Grapes = 6
```

Then add a second `clist-calc` block elsewhere in the note:

````markdown
```clist-calc
Fruit Total = Sum(Bananas)+Sum(Grapes) @bold
```
````

The block finds `Bananas` and `Grapes` from the markdown list above it and calculates the total. Your plain markdown list is also rendered as a normal interactive checklist in Obsidian — two features at once.

---

## 5. Core Concepts

### 5.1 The Render Block

Every CList Calc table lives inside a **fenced code block** with the language tag `clist-calc`:

````markdown
```clist-calc
... your configuration and rows go here ...
```
````

**Key facts:**
- You can have **multiple** `clist-calc` blocks in one note
- All blocks in a note **share the same data tree** — they all see all list items from the whole file
- Each block renders only its own rows, but can reference labels from anywhere in the file
- Blocks update automatically when you edit the note or check/uncheck checkboxes

---

### 5.2 List Item Syntax

The syntax is slightly different depending on **where** the item appears.

#### Outside the block (Syntax B — markdown body)

Items in the note body use standard markdown list format:

```
- [ ] Label = Expression
- [x] Label = Expression
- Label = Expression
```

| Part         | Description                                   | Required |
|--------------|-----------------------------------------------|----------|
| `- [ ]`      | Checkbox prefix (or `-` for plain items)      | Yes      |
| `Label`      | The name for this row — becomes a variable    | Yes      |
| `=`          | Separator                                     | Yes      |
| `Expression` | A number, formula, or label reference         | Yes      |

#### Inside the block (Syntax A — inside `clist-calc`)

> **Important:** Inside a `clist-calc` block, write rows **without** the `- [ ]` checkbox prefix. Just write `Label = Expression` directly. The `- [ ]` syntax belongs in your markdown body, not inside a code block.

```
Label = Expression
Label = Expression @directive
// Label = Expression    ← hidden row (calculated but not shown)
---Section Title---       ← section header
```

**Correct ✅**
```
Rice = 120
Oil = 95
Total = Rice+Oil @bold
```

**Avoid inside the block ⚠️**
```
- [ ] Rice = 120         ← works but is confusing style; reserve - [ ] for markdown body
- [ ] Total = Rice+Oil   ← works but noisy
```

Lines **without an `=` sign** (and not a header) are skipped by the renderer:

```
- [ ] My Shopping List      ← header in markdown body, skipped (no = sign)
    - [ ] Bread = 30        ← data row
    - [ ] Milk = 20         ← data row
```

---

### 5.3 Checkbox vs Plain Items

Both types work in both Syntax A and Syntax B:

| Type               | Syntax               | Notes                          |
|--------------------|----------------------|--------------------------------|
| Checkbox (empty)   | `- [ ] Label = 10`   | Item active, value counts      |
| Checkbox (checked) | `- [x] Label = 10`   | Item done, value still counts  |
| Plain dash         | `- Label = 10`       | Always active, no checkbox     |

---

### 5.4 Inline Unit Suffix & Prefix/Suffix Strings

There are two ways to attach text to a value:

#### Trailing word unit (simple)

Append a currency or unit keyword directly after the expression — no quotes needed:

```
Rice = 10*12 BDT
Book = 250 BDT
Total = Rice+Book BDT
```

The plugin strips the trailing word before calculating and reattaches it for display. Units can be any script: `BDT`, `USD`, `টাকা`, `€`, `kg`, `km`, `hrs`, etc.

#### Quoted string prefix and/or suffix

For full control — including symbols, spaces, or combining prefix and suffix — use double-quoted strings joined with `+`:

```
Label = "prefix" + expression
Label = expression + "suffix"
Label = "prefix" + expression + "suffix"
```

**Examples:**

| Line | Displayed value |
|------|-----------------|
| `Total = "৳" + Rice+Oil+Eggs` | ৳ 285 |
| `Price = Rice + " per kg"` | 120 per kg |
| `Label = "~" + Round2(Avg(Items)) + " avg"` | ~95.00 avg |
| `Status = "Total: " + Sum(Items) + " BDT"` | Total: 285 BDT |

> If you use `#currency: BDT` as a block directive, all rows in that block get the unit automatically — no need to write it on every line. The `#currency` value appends after any inline suffix you specify.

---

### 5.5 Nested Children

Indent with spaces or tabs to create child items under a parent. This works in both syntaxes — even when the list is in the markdown body:

**Syntax B example — nested list in markdown:**

```markdown
- [ ] Groceries
    - [ ] Vegetables = 150
    - [ ] Fruits = 200
    - [ ] Dairy = 80
```

**Then reference children from inside the block:**

````markdown
```clist-calc
#title: Grocery Summary

Veg Cost = Groceries.Vegetables
Total = Sum(Groceries) @bold
```
````

There is no limit on nesting depth.

---

### 5.6 Variables & References

Every row's **Label** automatically becomes a variable. Any expression written below it (in the same block or in a later block) can use that label by name.

```
Pen = 50
Pencil = 20
Both = Pen+Pencil
Discount = Both*0.05
Final = Both-Discount
```

**Rules:**
- Variables are resolved **top to bottom, file-wide** — an item defined in the markdown above the block is available to that block
- Labels are **case-sensitive**: `Pen` ≠ `pen`
- Labels support **all Unicode scripts**: Arabic, Bangla, CJK, Latin, etc.
- For nested items use dot notation: `Parent.Child`

---

## 6. Block Directives (Settings)

Block directives go at the **top of the `clist-calc` block** before any list rows. They configure the whole table.

```
#directive: value
```

| Directive          | Values                                                     | Default   | Description                             |
|--------------------|------------------------------------------------------------|-----------|-----------------------------------------|
| `#title: Text`     | Any text                                                   | None      | Caption shown above the table           |
| `#mode: compact`   | `compact` · `wide` · `default`                             | `default` | Row padding density                     |
| `#cols: 3`         | `2` · `3`                                                  | `2`       | Add a Note column between Label & Value |
| `#currency: BDT`   | Any text (`BDT`, `USD`, `৳`, `€`, `kg`…)                  | None      | Unit appended to every numeric value    |
| `#decimals: 0`     | `0` · `1` · `2` · `3`                                     | `2`       | Decimal places on all numbers           |
| `#theme: green`    | `default` `green` `blue` `purple` `red` `orange` `teal`   | `default` | Accent color for headers and highlights |
| `#colwidth: 200px` | Any CSS width                                              | Auto      | Label column width                      |

**Example:**

````markdown
```clist-calc
#title: Monthly Expenses
#currency: BDT
#decimals: 0
#theme: blue
#mode: compact

Rent = 8000
Food = 3500
Total = Rent+Food @bold
```
````

---

## 7. Row Directives (Per-Line Options)

Row directives go **at the end of a line** using `@`. They only work inside the `clist-calc` block.

```
Label = Expression @directive
Label = Expression @directive:value
```

### Display & Layout

| Directive           | Example                               | Description                                             |
|---------------------|---------------------------------------|---------------------------------------------------------|
| `@bold`             | `Total = 100 @bold`                   | Bold + accent color on the value                        |
| `@highlight`        | `Item = 50 @highlight`                | Highlight row with theme accent color                   |
| `@highlight:color`  | `Item = 50 @highlight:#e74c3c`        | Highlight row with any CSS color                        |
| `@note:text`        | `Item = 50 @note:see details`         | Text in middle column (requires `#cols: 3`)             |
| `@bar`              | `Score = 75 @bar @max:100`            | Visual progress bar                                     |
| `@max:N`            | `Score = 75 @bar @max:100`            | Maximum value for progress bar                          |
| `@indent:N`         | `Sub = 10 @indent:2`                  | Manually set indent depth                               |
| `@span:N`           | `Item = 10 @span:2`                   | Merge with next N-1 rows (rowspan)                      |
| `@Copy`             | `Price = 500 @Copy`                   | Copy icon on hover — click to copy the value            |
| `@h`                | `Section Title @h`                    | Full-width section header row                           |
| `@separator`        | `@separator`                          | Thin horizontal divider line                            |

### Value Text Styles *(new in V1.4)*

| Directive           | Example                               | Description                                             |
|---------------------|---------------------------------------|---------------------------------------------------------|
| `@del` / `@strike`  | `Old Price = 500 @del`                | Strikethrough on the value                             |
| `@u` / `@underline` | `Final = 450 @u`                      | Underline the value                                    |
| `@i` / `@italic`    | `Note = 0 @i`                         | Italic value text                                      |
| `@color:#hex`       | `Profit = 200 @color:#22c55e`         | Custom CSS color on the value (any hex or name)        |
| `@dim`              | `Helper = 0 @dim`                     | Dim value to 45% opacity                               |
| `@success`          | `Result = 100 @success`               | Green semantic color on value                          |
| `@warning`          | `Overdue = 5 @warning`                | Orange semantic color on value                         |
| `@danger`           | `Deficit = -200 @danger`              | Red semantic color on value                            |
| `@tag:Text`         | `Status = 0 @tag:promo`               | Colored badge in the Note column (3-col mode)          |

### Label Cell Styles *(new in V1.4)*

| Directive           | Example                               | Description                                             |
|---------------------|---------------------------------------|---------------------------------------------------------|
| `@label-bold`       | `Total = 100 @label-bold`             | Bold the label text                                    |
| `@label-del`        | `Removed = 50 @label-del`             | Strikethrough on label                                 |
| `@label-u`          | `Key = 80 @label-u`                   | Underline the label                                    |
| `@label-i`          | `Hint = 0 @label-i`                   | Italic label text                                      |
| `@label-muted`      | `Sub Item = 30 @label-muted`          | Muted/grey label color                                 |

### Section Headers

Two ways to add a section header row:

```
---Income---
```
or
```
Income @h
```

Both render identically as a styled, full-width header row.

### Hidden Lines

Prefix a line with `//` to **calculate it silently** — the row is computed but not shown in the table:

```
Price = 1000
// Tax = Price*0.15       ← calculated but hidden from table
Final = Price+Tax         ← can still use Tax here
```

> Hidden lines (`//`) only work inside the `clist-calc` block.

---

## 8. Math Functions Reference

Use these inside any expression in the block, or in Syntax B list items.

### Basic Math

| Function           | Example             | Result |
|--------------------|---------------------|--------|
| `Abs(x)`           | `Abs(-50)`          | 50     |
| `Root(x)`          | `Root(16)`          | 4      |
| `nRoot(x, n)`      | `nRoot(27, 3)`      | 3      |
| `Power(x, n)`      | `Power(2, 8)`       | 256    |
| `Ceil(x)`          | `Ceil(4.2)`         | 5      |
| `Floor(x)`         | `Floor(4.9)`        | 4      |
| `Round(x)`         | `Round(4.567)`      | 5      |
| `Round(x, n)`      | `Round(4.567, 2)`   | 4.57   |
| `Round2(x)`        | `Round2(4.567)`     | 4.57   |
| `Clamp(v,min,max)` | `Clamp(150, 0, 100)`| 100    |
| `Lerp(a, b, t)`    | `Lerp(0, 100, 0.3)` | 30     |

### Finance & Percentages

| Function                     | Example                            | Description                    |
|------------------------------|------------------------------------|--------------------------------|
| `Pct(value, total)`          | `Pct(25, 200)`                     | 12.5 (25/200 × 100)            |
| `GrowthRate(old, new)`       | `GrowthRate(100, 120)`             | 20 (% growth)                  |
| `SimpleInterest(P, r, t)`    | `SimpleInterest(10000, 5, 2)`      | 1000 (P×r×t/100)               |
| `CompoundInterest(P, r, n, t)`| `CompoundInterest(10000,0.05,12,1)`| 10511.6                        |
| `PMT(r, n, pv)`              | `PMT(0.005, 60, 20000)`            | Monthly loan payment           |

### Logarithmic & Trig

| Function   | Example     | Description          |
|------------|-------------|----------------------|
| `Log(x)`   | `Log(1000)` | Base-10 log → 3      |
| `Ln(x)`    | `Ln(2.718)` | Natural log          |
| `Sin(deg)` | `Sin(30)`   | 0.5                  |
| `Cos(deg)` | `Cos(60)`   | 0.5                  |
| `Tan(deg)` | `Tan(45)`   | 1                    |

### Constants

| Symbol | Value         |
|--------|---------------|
| `PI`   | 3.14159265…   |
| `E`    | 2.71828182…   |

### Conditional Logic

```
If(condition, value_if_true, value_if_false)
```

| Example                                | Result                           |
|----------------------------------------|----------------------------------|
| `If(Score >= 50, 1, 0)`               | 1 if Score ≥ 50, else 0          |
| `If(Total > 1000, Total*0.9, Total)`  | 10% off if over 1000             |
| `If(A > B, A, B)`                     | Maximum of A and B               |

Conditions support: `>` `<` `>=` `<=` `==` `!=` `and` `or` `not`

Nest `If()` for multiple conditions:
```
- Grade = If(Pct >= 90, "A+", If(Pct >= 80, "A", If(Pct >= 70, "B", "C")))
```

---

## 9. Aggregation Functions Reference

Aggregation functions operate on **groups of nodes** in the data tree. The path can come from a label defined in the block (Syntax A) or from a markdown list in the note body (Syntax B).

```
Function(path)
```

| Function               | Example                 | Description                                    |
|------------------------|-------------------------|------------------------------------------------|
| `Sum(path)`            | `Sum(Items)`            | Total of all children under the path           |
| `Avg(path)`            | `Avg(Scores)`           | Average of all children                        |
| `Max(path)`            | `Max(Prices)`           | Highest value                                  |
| `Min(path)`            | `Min(Prices)`           | Lowest value                                   |
| `Count(path)`          | `Count(Items)`          | Number of child items                          |
| `StdDev(path)`         | `StdDev(Data)`          | Standard deviation                             |
| `Median(path)`         | `Median(Scores)`        | Median value                                   |
| `Mode(path)`           | `Mode(Scores)`          | Most frequent value                            |
| `Range(path)`          | `Range(Data)`           | Max − Min                                      |
| `MaxLabel(path)`       | `MaxLabel(Scores)`      | Name of the item with the highest value        |
| `MinLabel(path)`       | `MinLabel(Scores)`      | Name of the item with the lowest value         |
| `AscadingList(path)`   | `AscadingList(Items)`   | Items sorted lowest → highest (as text)        |
| `DscadingList(path)`   | `DscadingList(Items)`   | Items sorted highest → lowest (as text)        |
| `TotalChecked(path)`   | `TotalChecked(Tasks)`   | Count of checked ✅ items under path           |
| `TotalUnchecked(path)` | `TotalUnchecked(Tasks)` | Count of unchecked items                       |
| `TotalCheckbox(path)`  | `TotalCheckbox(Tasks)`  | Total checkbox items under path                |
| `Pct(path1, path2)`    | `Pct(Done, All)`        | (Sum of path1 / Sum of path2) × 100            |
| `GrowthRate(p1, p2)`   | `GrowthRate(Last, This)`| % growth from sum of p1 to sum of p2           |

---

## 10. Path References

Path references reach into **nested items** from anywhere in the block. They work regardless of whether the nested list was written inside the block or in the markdown body.

### Dot Notation

```
Parent.Child
Parent.Child.GrandChild
```

**Example — external list referenced with dot path:**

Normal markdown in the note body:
```markdown
- [ ] Budget
    - [ ] Food = 3000
    - [ ] Travel = 5000
    - [ ] Entertainment = 1500
```

Inside the calc block:
````markdown
```clist-calc
Food Budget = Budget.Food
Total Budget = Sum(Budget) @bold
```
````

### When to Use What

| Situation                             | Use                    |
|---------------------------------------|------------------------|
| Reference a flat (top-level) item     | Just the label name    |
| Reference a specific child            | `Parent.Child`         |
| Sum all children of a parent          | `Sum(Parent)`          |
| Get max/min/avg across a group        | `Max(Parent)` etc.     |

---

## 11. Examples — Easy to Hard

---

### Example 1 — Simple Shopping List (Easy)

**Syntax A — everything inside the block.**

````markdown
```clist-calc
#title: Grocery Run
#currency: BDT
#decimals: 0

Rice = 120
Oil = 95
Onion = 40
Eggs = 70
Total = Rice+Oil+Onion+Eggs @bold @highlight
```
````

**What you learn:** Block directives, basic addition, `@bold`, `@highlight`.

---

### Example 2 — Monthly Budget (Easy–Medium)

**Syntax A — self-contained budget block.**

````markdown
```clist-calc
#title: My Monthly Budget
#currency: BDT
#decimals: 0
#theme: green

---Income---
Salary = 35000
Freelance = 8000
Total Income = Salary+Freelance @bold

---Expenses---
Rent = 9000
Food = 4500
Transport = 1500
Internet = 800
Misc = 1200
Total Expenses = Rent+Food+Transport+Internet+Misc @bold @highlight:red

---Summary---
Savings = Total Income-Total Expenses @bold @highlight
Savings % = Round2(Pct(Savings, Total Income))
```
````

**What you learn:** Section headers `---Title---`, multiple `@` directives per line, `Pct()`.

---

### Example 3 — Nested Project Cost (Medium)

**Syntax A — nested categories summed with `Sum()`.**

````markdown
```clist-calc
#title: Website Project Cost
#currency: USD
#decimals: 2
#theme: blue

Design
    Logo = 150
    UI Mockup = 300
    Icons = 80

Development
    Frontend = 800
    Backend = 1200
    Database = 400

Marketing
    Social Media = 250
    SEO = 300
    Ads = 500

---Totals---
Design Total = Sum(Design)
Dev Total = Sum(Development)
Marketing Total = Sum(Marketing)
Grand Total = Sum(Design)+Sum(Development)+Sum(Marketing) @bold @highlight
// Tax = Grand Total*0.10
Final Price = Grand Total+Tax @bold @highlight:green
```
````

**What you learn:** Deep nesting, `Sum(Parent)`, hidden `//` lines, chained arithmetic.

---

### Example 4 — Student Marks & Grade (Medium)

**Syntax A — conditional grade with nested `If()`.**

````markdown
```clist-calc
#title: Semester Result
#cols: 3
#decimals: 1
#theme: purple

---Subject Marks---
Math = 82 @note:out of 100
English = 75 @note:out of 100
Science = 90 @note:out of 100
History = 68 @note:out of 100
Computer = 95 @note:out of 100

---Analysis---
Total = Math+English+Science+History+Computer @bold
Out Of = 500
Percentage = Round2(Pct(Total, Out Of)) @note:% @bold @highlight
Best Subject = MaxLabel(Math) @Copy
Weakest Subject = MinLabel(Math) @Copy
Average = Round2(Avg(Math)) @note:avg marks

---Grade---
Grade = If(Percentage>=90, "A+", If(Percentage>=80, "A", If(Percentage>=70, "B", If(Percentage>=60, "C", "F")))) @bold @highlight
```
````

**What you learn:** `#cols: 3` + `@note:`, `MaxLabel()`, `MinLabel()`, `@Copy`, nested `If()`, string output.

---

### Example 5 — Markdown List + Calc Block (Medium)

**Syntax B — list lives in the note body, block just calculates.**

This example shows a note where the shopping list is a real Obsidian checklist you tick off while shopping. The calc block at the bottom reads those items and shows a summary.

First, write this as **normal markdown** anywhere in your note:

```markdown
## This Week's Shopping

Check items off as you go:

- [ ] Rice = 120
- [ ] Lentils = 80
- [ ] Vegetables
    - [ ] Tomatoes = 35
    - [ ] Onions = 25
    - [ ] Potatoes = 30
- [ ] Bread = 45
- [ ] Eggs = 90
```

Then, below your prose, add the calc block:

````markdown
```clist-calc
#title: Shopping Summary
#currency: BDT
#decimals: 0
#theme: teal

---Item Costs---
Rice = Sum(Rice) @Copy
Lentils = Sum(Lentils) @Copy
Vegetables Total = Sum(Vegetables) @Copy

---Total---
Subtotal = Sum(Rice)+Sum(Lentils)+Sum(Vegetables)+Sum(Bread)+Sum(Eggs) @bold @highlight
Checked Items = TotalChecked(Rice) @note:items done
Remaining = TotalUnchecked(Rice) @note:items left
```
````

**Notice:** `Rice`, `Lentils`, etc. are **not defined inside the block** — they come from the markdown list above. The block references them with `Sum()` to safely pull their values. You can check off items in the list and the totals update live.

**What you learn:** Syntax B, reading external list data, `Sum()` on external nested items, `TotalChecked()`, `TotalUnchecked()`, mixing prose and calculation.

---

### Example 6 — Business Profit & Loss (Medium–Hard)

**Syntax B — two separate markdown lists, one calc block reads both.**

**Normal markdown in the note body:**

```markdown
## Q1 Sales

- [ ] Q1 Sales
    - [ ] Product A = 85000
    - [ ] Product B = 42000
    - [ ] Services = 28000

## Q2 Sales

- [ ] Q2 Sales
    - [ ] Product A = 102000
    - [ ] Product B = 38000
    - [ ] Services = 35000

## Costs

- [ ] Q1 Costs = 65000
- [ ] Q2 Costs = 72000
```

**The calc block:**

````markdown
```clist-calc
#title: Q1 vs Q2 P&L
#currency: BDT
#decimals: 0
#theme: teal
#cols: 3

---Revenue---
Q1 Revenue = Sum(Q1 Sales) @bold @note:Q1
Q2 Revenue = Sum(Q2 Sales) @bold @note:Q2
Revenue Growth = Round2(GrowthRate(Q1 Revenue, Q2 Revenue)) @note:% change

---Profit---
Q1 Profit = Q1 Revenue-Sum(Q1 Costs) @highlight
Q2 Profit = Q2 Revenue-Sum(Q2 Costs) @highlight
Profit Growth = Round2(GrowthRate(Q1 Profit, Q2 Profit)) @note:% change @bold

---Margins---
Q2 Margin = Round2(Pct(Q2 Profit, Q2 Revenue)) @note:profit %
Q2 vs Target = Q2 Profit @bar @max:50000
```
````

**What you learn:** Multiple external lists feeding one block, `GrowthRate()`, `@bar @max:N`, combining everything.

---

### Example 7 — Loan & Interest Calculator (Hard)

**Syntax A — financial functions with hidden intermediate variables.**

````markdown
```clist-calc
#title: Loan Calculator
#currency: BDT
#decimals: 2
#theme: red

---Loan Details---
Principal = 500000
Annual Rate % = 12
Years = 3
Payments Per Year = 12

---Results---
// MonthlyRate = Annual Rate %/100/Payments Per Year
// TotalPayments = Years*Payments Per Year

Simple Interest = SimpleInterest(Principal, Annual Rate %, Years) @bold
Simple Total = Principal+Simple Interest @highlight

Compound Total = Round2(CompoundInterest(Principal, Annual Rate %/100, Payments Per Year, Years)) @bold
Compound Interest Paid = Compound Total-Principal @highlight:orange

Monthly Payment (EMI) = Round2(PMT(MonthlyRate, TotalPayments, Principal)) @bold @highlight @Copy
Total Paid = Monthly Payment (EMI)*TotalPayments
Total Interest = Total Paid-Principal @bold @highlight:red
```
````

**What you learn:** `SimpleInterest()`, `CompoundInterest()`, `PMT()`, chained hidden variables, `@Copy` on the key result.

---

### Example 8 — Full Inventory with Themes (Hard)

**Syntax B + Syntax A mixed — inventory in markdown, stats in the block.**

**Normal markdown lists in the note body:**

```markdown
## Electronics Inventory

- [ ] Electronics
    - [ ] Headphones = 1200
    - [ ] Keyboard = 850
    - [ ] Mouse = 450
    - [ ] Webcam = 2200

## Stationery Inventory

- [ ] Stationery
    - [ ] Pens = 50
    - [ ] Notebooks = 120
    - [ ] Markers = 80
```

**The calc block — adds extra rows inline and combines with external data:**

````markdown
```clist-calc
#title: Inventory Report — May 2025
#currency: BDT
#decimals: 0
#theme: orange
#cols: 3

---Category Totals---
Electronics Total = Sum(Electronics) @bold @highlight
Stationery Total = Sum(Stationery) @bold @highlight
Grand Total = Electronics Total+Stationery Total @bold @highlight:green

---Statistics---
Most Expensive = MaxLabel(Electronics) @note:electronics @Copy
Cheapest Item = MinLabel(Stationery) @note:stationery @Copy
Elec Average = Round(Avg(Electronics), 0) @note:avg price
Electronics Share = Round2(Pct(Electronics Total, Grand Total)) @note:% of total @bar @max:100

---Sorted---
High to Low = DscadingList(Electronics) @note:by price
Low to High = AscadingList(Stationery) @note:by price
```
````

**What you learn:** Full Syntax B with nested external data, `MaxLabel()`, `MinLabel()`, `DscadingList()`, `AscadingList()`, `@bar @max:100` as a percentage bar, `@Copy`.

---

## 12. Practice Exercises

Try these yourself! Work through them in order.

---

### 🟢 Practice 1 — Pocket Money Tracker (Syntax A)

Write a `clist-calc` block that:
- Lists 5 things you spent money on this week (any amounts)
- Shows each item with a BDT unit suffix
- Calculates the total spent
- Shows how much is left from a 1000 BDT weekly budget

<details>
<summary>Hint — click to reveal</summary>

```
#currency: BDT
#decimals: 0

Item1 = 150
Item2 = 200
...
Total Spent = Item1+Item2+... @bold
Budget = 1000
Remaining = Budget-Total Spent @highlight
```
</details>

---

### 🟡 Practice 2 — Class Scores (Syntax A)

Write a block that:
- Has marks for 6 subjects (numbers between 40 and 100)
- Shows total, percentage (out of 600), the name of the best subject, and the name of the worst
- Shows a grade: A+ ≥ 90%, A ≥ 80%, B ≥ 70%, C ≥ 60%, else F

---

### 🟠 Practice 3 — Trip Budget (Syntax B)

Write your trip budget as a **normal markdown checklist** in the note body with 3 nested categories (Transport, Hotel, Food) each having 3 sub-items. Then write a `clist-calc` block that:
- Shows category totals using `Sum()`
- Shows the grand total
- Shows each category's percentage share of the total using `Pct()`

---

### 🟠 Practice 4 — Task Tracker (Syntax B)

Write a task list in normal markdown with at least 8 items (some checked, some not). Then write a `clist-calc` block that:
- Shows total tasks, completed tasks, and remaining tasks using `TotalCheckbox()`, `TotalChecked()`, `TotalUnchecked()`
- Shows completion percentage
- Shows a progress bar toward 100% completion

---

### 🔴 Practice 5 — Savings Goal (Syntax A + hidden vars)

Write a block that:
- Has a savings goal (e.g. 50000 BDT)
- Lists monthly savings for 6 months
- Calculates total saved, average monthly saving (hidden)
- Shows a progress bar toward the goal
- Shows estimated months left to reach the goal using `Ceil()`

<details>
<summary>Hint</summary>

```
// AvgMonthly = Avg(Month)
// MonthsLeft = Ceil((Goal-Total)/AvgMonthly)
Progress = Total @bar @max:Goal
Months Remaining = MonthsLeft @bold
```
</details>

---

## 13. Tips, Tricks & Common Mistakes

### ✅ Best Practices

**Use `#decimals: 0` for money amounts** — most currencies don't need 4 decimal places.

**Use `//` for helper variables** — keeps the table clean:
```
// MonthlyRate = AnnualRate/12/100
Payment = PMT(MonthlyRate, 60, Loan) @bold
```

**Use `Sum(Parent)` instead of adding each child manually** — much cleaner when the group is large:
```
Total = Sum(Expenses)    ← instead of E1+E2+E3+E4+E5
```

**Use Syntax B when your list has a life beyond just calculation** — if you want to check items off, search them, link to them, or read them in the note body, write the list in markdown and let the block just summarize.

**Use `@bold @highlight` on totals** — makes the key number stand out immediately.

---

### ❌ Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| `- [] Item = 10` | Missing space in checkbox | Use `- [ ]` with a space inside (markdown body only) |
| `Total = total+item` | Case mismatch | Labels are case-sensitive — use the exact same casing |
| `- [ ] Total = ...` inside the block | Confusing, mixes styles | Use `Total = ...` bare style inside the block |
| `Rice+Oil+Eggs` for Syntax B items | May be unreliable | Use `Sum(Rice)+Sum(Oil)+Sum(Eggs)` to be safe |
| Reference a label defined below it | Returns 0 | Move referenced rows above the row that uses them |
| `Sum()` with no path | Syntax error | Write `Sum(ParentLabel)` |
| `#title:` in the middle of the block | Directive ignored | All `#` directives must go at the very top |
| `@bar` without `@max:` | Bar always fills 100% | Always pair `@bar` with `@max:yourMaxValue` |
| Using `@note:` without `#cols: 3` | Note column invisible | Add `#cols: 3` to the block directives |
| Syntax B label defined after the block | Not found | The plugin reads top to bottom — put the markdown list above the block |
| Long label with spaces used in a path | Path may break | Use single-word labels for items you reference with dot notation |

---

### 💡 Useful Patterns

**Percentage of total:**
```
Item A = 300
Item B = 200
Total = Item A+Item B
A Share % = Round2(Pct(Item A, Total))
```

**Conditional discount:**
```
Price = 1500
Discount = If(Price > 1000, Price*0.10, 0)
Final = Price-Discount @bold
```

**Target vs actual bar:**
```
Target = 10000
Actual = 7500
Progress = Actual @bar @max:10000
Achievement % = Round2(Pct(Actual, Target))
```

**Prefix/suffix string syntax:**
```
Total = "৳ " + Sum(Items)
Rate = Avg(Scores) + " / 100"
Label = "~" + Round2(Avg(Data)) + " avg"
```

**Syntax B: one list, two different calc blocks:**

```markdown
- [ ] Jan = 5000
- [ ] Feb = 7000
- [ ] Mar = 6500
```

````markdown
```clist-calc
#title: Q1 Total
Total = Sum(Jan)+Sum(Feb)+Sum(Mar) @bold
```
````

````markdown
```clist-calc
#title: Q1 Statistics
Average = Round2(Avg(Jan))
Best Month = MaxLabel(Jan)
Growth = Round2(GrowthRate(Jan, Mar))
```
````

Both blocks read the same markdown list — completely different outputs.

---

## 14. Quick Reference Card

```
╔══════════════════════════════════════════════════════════════════╗
║            CLIST CALC — QUICK REFERENCE V1.4                    ║
╠══════════════════════════════════════════════════════════════════╣
║  TWO SYNTAXES                                                    ║
║                                                                  ║
║  SYNTAX A — list inside block (no - [ ] prefix):                 ║
║    ```clist-calc                                                 ║
║    #directives                                                   ║
║    Item = 100                                                    ║
║    Total = Item @bold                                            ║
║    ```                                                           ║
║                                                                  ║
║  SYNTAX B — list in markdown body, block reads it:              ║
║    Normal markdown anywhere in the note:                         ║
║      - [ ] Item = 100                                            ║
║                                                                  ║
║    Then the calc block (use Sum() for safe references):          ║
║    ```clist-calc                                                 ║
║    Total = Sum(Item) @bold                                       ║
║    ```                                                           ║
║                                                                  ║
║  Both syntaxes can be freely mixed in the same note.             ║
╠══════════════════════════════════════════════════════════════════╣
║  ROW SYNTAX (inside block — no - [ ] needed)                     ║
║    Label = expr              → plain row                         ║
║    Label = expr UNIT         → inline unit suffix (BDT, kg…)    ║
║    Label = "prefix" + expr   → string prefix                    ║
║    Label = expr + "suffix"   → string suffix                    ║
║    // Label = expr           → hidden (calc only, not shown)     ║
║    ---Title---               → section header                   ║
╠══════════════════════════════════════════════════════════════════╣
║  BLOCK DIRECTIVES (#) — top of block only                        ║
║    #title: My Table    → caption                                ║
║    #currency: BDT      → unit on all numbers                    ║
║    #decimals: 0        → decimal places (0–3)                   ║
║    #theme: green       → accent color                           ║
║    #mode: compact      → compact | wide | default               ║
║    #cols: 3            → show note column                       ║
╠══════════════════════════════════════════════════════════════════╣
║  ROW DIRECTIVES (@) — end of any block row                       ║
║  Display:                                                        ║
║    @bold   @highlight   @highlight:#color                       ║
║    @note:text   @bar @max:N   @indent:N                         ║
║    @span:N   @Copy   @h   @separator                            ║
║  Value styles (V1.4):                                            ║
║    @del/@strike   @u/@underline   @i/@italic                    ║
║    @color:#hex   @dim                                            ║
║    @success   @warning   @danger                                 ║
║    @tag:Text                                                     ║
║  Label styles (V1.4):                                            ║
║    @label-bold  @label-del  @label-u  @label-i  @label-muted    ║
╠══════════════════════════════════════════════════════════════════╣
║  MATH                                                            ║
║    + - * / %  Power(x,n)  Root(x)  Abs(x)                      ║
║    Round(x,n)  Ceil(x)  Floor(x)  Clamp(v,lo,hi)               ║
║    If(cond, true, false)  and  or  not                          ║
╠══════════════════════════════════════════════════════════════════╣
║  FINANCE                                                         ║
║    Pct(v,total)  GrowthRate(old,new)                            ║
║    SimpleInterest(P,r,t)  CompoundInterest(P,r,n,t)             ║
║    PMT(rate,nper,pv)                                            ║
╠══════════════════════════════════════════════════════════════════╣
║  AGGREGATIONS                                                    ║
║    Sum(path)  Avg(path)  Max(path)  Min(path)                   ║
║    Count(path)  Median(path)  StdDev(path)                      ║
║    MaxLabel(path)  MinLabel(path)                               ║
║    AscadingList(path)  DscadingList(path)                       ║
║    TotalChecked(path)  TotalUnchecked(path)                     ║
╠══════════════════════════════════════════════════════════════════╣
║  PATHS                                                           ║
║    Parent.Child            → direct child value                 ║
║    Parent.Child.GrandChild → deep reference                     ║
║    Sum(Parent)             → sum of all children                ║
║    Works with both Syntax A and Syntax B lists.                 ║
╠══════════════════════════════════════════════════════════════════╣
║  COPY TOOLBAR (V1.4)                                             ║
║    Copy as Text  → Label: Value  pairs, one per line            ║
║   Copy MD       → Markdown table format                        ║
║    Export CSV    → download .csv file                           ║
╚══════════════════════════════════════════════════════════════════╝
```
 
---

*Documentation for CList Calc V1.4 — Made with ❤️ for Obsidian users*
