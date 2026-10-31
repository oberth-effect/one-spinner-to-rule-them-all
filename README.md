# one-spinner-to-rule-them-all

A Claude Code plugin that replaces the words in the working spinner with ominous lines from J.R.R. Tolkien's legendarium.
Instead of `Sauteing…`, Claude is `Delving too greedily and too deep…` or `Weaving webs of shadow…`.

It works like [better-spinner-verbs](https://github.com/widlarizer/better-spinner-verbs), with a Tolkien list as the default.

## Installation

In Claude Code:

```
/plugin install one-spinner-to-rule-them-all --marketplace oberth-effect/one-spinner-to-rule-them-all
```

From a shell:

```
claude plugin install one-spinner-to-rule-them-all --marketplace oberth-effect/one-spinner-to-rule-them-all
```

In the desktop app: + → Plugins → Add marketplace → `oberth-effect/one-spinner-to-rule-them-all` → Add plugin.

## Settings

Both settings appear in `/config` under the plugin's name.

- **Spinner verbs**: the lines to show. The default is the Tolkien list. Typed as one text, separate lines with new lines or semicolons. Commas stay inside a line, because many of the lines contain one.
- **Mode**: `replace` shows only these lines. `mix` adds Claude Code's own words to the pool.

Claude Code draws the `…` after each line itself, so the lines are written without it. A line you add that already ends in `...` or `…` has those dots removed, so you never see two.

One line is picked per turn and stays for the whole turn. On the desktop app the spinner describes the current step instead, so the plugin leaves it alone there.

## Sources

[docs/sources.md](docs/sources.md) lists every default line with its original wording, the speaker, the work and the chapter.
Each was checked word for word against the books. None come from the films.
