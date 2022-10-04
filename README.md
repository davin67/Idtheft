# Sentry Documentation

The Sentry documentation is a static site, generated with [Gatsby][gatsby].

## Getting started

You will need [Volta][volta] and [pre-commit][pre-commit] installed. If you don't have opinions about the process, this will get you going:

```bash
# Install Homebrew and everything mentioned above
$ bin/bootstrap
```

Once you have the required system dependencies:

```bash
# Install or update application dependencies
$ make
```

Now run the development webserver:

```bash
$ yarn start
```

You will now be able to access docs via http://localhost:3000.

[gatsby]: https://gatsbyjs.org
[volta]: https://volta.sh/
[pre-commit]: https://pre-commit.com/

## Markdown Documentation

Documentation is written in Markdown (via Remark) and MDX.

[<kbd>Read the quick reference</kbd>](https://daringfireball.net/projects/markdown/syntax)

## Standard Frontmatter

The standard frontmatter will apply on nearly every page:

`title`

: Document title - used in `<title>` as well as things like search titles.

`noindex` (false)

: Set this to true to disable indexing (robots, algolia) of this content.

`notoc` (false)

: Set this to true to disable table of contents rendering.

`draft` (false)

: Set this to true to mark this page as a draft, and hide it from various other components.

`keywords` ([])

: A list of keywords for indexing with search.

`description`

: A description to use in the `<meta>` header, as well as in auto generated page grids.

`sidebar_order` (10)

: The order of this page in auto generated sidebars and grids.


## Redirects

Redirects are supported via yaml frontmatter in `.md` and `.mdx` files:

```yaml
---
redirect_from:
  - /performance-monitoring/discover/
---
```

These will be generated as both client-side (using an empty page with a meta tag) and server-side (nginx rules).

## Wizard Pages

A number of pages exist to provide content within Sentry installations. We refer to this system as the _Wizard_. These pages are found in Gatsby's `wizard` content directory, and are rendered and exported to a JSON file for use within the `getsentry/sentry` application.

Each page consists of some wizard-specific frontmatter, as well as a markdown body:

```markdown
---
name: Platform Name
doc_url: Permalink for this page
type: framework
support_level: production
---

This is my  content.
```

## Search

Search is powered by Algolia, and will index all content in /docs/ that is Markdown or MDX formatted.

It will _not_ index documents with any of the following in their frontmatter:

- `draft: true`
- `noindex: true`

## Notes on Markdown vs MDX


:pray: that MDX v2 fixes this.

MDX has its flaws. When rendering components, any text inside of them is treated as raw text (_not_ markdown). To work around this you can use the `<markdown>` tag, but it also has its issues. Generally speaking, put an empty line after the opening tag, and before the closing tag.

```jsx
// don't do this as parsing will hit weird breakages
<markdown>
foo bar
</markdown>
```

```jsx
// do this
<markdown>

foo bar

</markdown>
```

## Platform / SDK Docs

The current generation platform content lives in `src/platforms` and follows some specific rules to generate content. These rules are enforced via the directory structure:

```
[platformName]/
  child.mdx
  childTwo/
    index.mdx
  common/
    aSharedPage.mdx
  guides/
    [guideName]/
      uniqueChild.mdx
      childTwo/
        index.mdx
```

Platforms will generate a list of "guides", and inherit all content within common. Given the above example, we end up with a variety of semi-duplicated URLs:

```
/platforms/platformName/
/platforms/platformName/child/
/platforms/platformName/childTwo/
/platforms/platformName/aSharedPage/
/platforms/platformName/guides/guideName/
/platforms/platformName/guides/guideName/child/
/platforms/platformName/guides/guideName/uniqueChild/
/platforms/platformName/guides/guideName/childTwo/
/platforms/platformName/guides/guideName/aSharedPage/
```

This is generated by inheriting all content with the ``common/`` directory, then adding (or overriding with) content from the siblings (or children as we'd call them). In the above example, you'll see ``aSharedPage`` is loaded at two different URLs, and ``childTwo`` is overwritten by ``guideName``.

The sidebar on platform pages (handled by ``<PlatformSidebar>``) will generate with the Guide, or the Base Platform being the primary section, in addition to a list of other guides available in a section below it. This means that all content is focused on the current guide (usually a framework) they're in, ensuring ease of navigation.

### Globally Shared Content

In addition to platform-shared content (via ``common/``) you can also defined globally shared content (shared by all platforms and guides). This is done by placing the content into the top-level ``/platforms/common/`` path. It works very much the same as the platform-level common content.

## Extended Markdown Syntax

### Variables

A transformation is exposed to both Markdown and MDX files which supports processing variables in a Django/Jekyll-style way. The variables available are globally scoped and configured within `gatsby-config.js` (via `gatsby-remark-variables`).

For example:

```markdown
JavaScript SDK: {{ packages.version('sentry.browser.javascript') }}
```

In this case, we expose ``packages`` as an instance of ``PackageRegistry`` which is why there is a `packages.version` function available. Additional, we expose a default context variable of ``page`` which contains the frontmatter of the given markdown node. For example, ``{{ page.title }}``.

When a function call is invalid (or errors), or doesn't match something in the known scope, it will simple render it as a literal value instead. So for example:

```markdown
setFingerprint('{{ default }}')
```

Will render as:

```markdown
setFingerprint('{{ default }}')
```

This is because there is no entity scoped to ``default`` in the template renderer. Additionally - in this case - we also add the ``default`` expression to the exclusion list in our configuration, as it is commonly use in our documentation.

### ``packages``

The ``packages`` helper is an instance of ``PackageRegistry`` and exposes several methods.

#### ``packages.version``

Returns the latest version of the given package.

```javascript
packages.version('sentry.javacript.browser')
```

You may also optionally specify a fallback for if the package isnt found (or theres an upstream error):

```javascript
packages.version('sentry.javacript.browser', '1.0.0')
```

#### ``packages.checksum``

Returns the checksum of a given file in a package.

```javascript
packages.checksum('sentry.javacript.browser', 'bundle.min.js', 'sha384')
```

## Extended MDX Syntax

We expose several default tags to aid with documentation.

### Alert

Render an alert callout.

Attributes:

- `title` (string)
- `level` (string)
- `dismiss` (boolean)

```javascript
<Alert level="info" title="Note"><markdown>

This is an alert

</markdown></Alert>
```

See also the Note component.

### ConfigKey

Render a heading with a configuration key in the correctly cased format for a given platform.

If content is specified, it will automatically hide the content when the given `platform` is not selected in context.

Attributes:

- `name` (string)
- `platform` (string) - defaults to the `platform` value from the page context or querystring
- `supported` (string[])
- `notSupported` (string[])

```javascript
<ConfigKey name="send-default-pii" notSupported={["javascript", "node"]}><markdown>

Description of send-default-pii

</markdown></ConfigKey>
```

### Code Blocks

Consecutive code blocks will be automatically collapsed into a tabulated container.  This behavior is generally useful if you want to define an example in multiple languages:


````markdown
```javascript
function foo() { return 'bar' }
```

```python
def foo():
  return 'bar'
```
````

Some times you may not want this behavior. To solve this you can either break up the code blocks with some additional text, or you can use the ``<Break />`` component.

Additionally code blocks also support `tabTitle` and `filename` properties:

````markdown
```javascript {tabTitle: Hello} {filename: index.js}
var foo = "bar";
```
````

### Note

Render a note.


```javascript
<Note><markdown>

Something important, but maybe not _that_ important.

</markdown></Note>
```

See also the Alert component.

### PageGrid

Render all child pages of this document, including their `description` if available.

```markdown
<PageGrid />
```

### PlatformContent

Render an include based on the currently selected `platform` in context.

Attributes:

- `includePath` (string) - the subfolder within `src/includes` to map to
- `platform` (string) - defaults to the `platform` value from the page context or querystring
- `fallbackPlatform` (string) - default platform for when no content matches

```javascript
<PlatformContent includePath="sdk-init" />
```

Some notes:

- When the current platform comes from the page context and no matching include is found, the content will be hidden.

- When the current platform comes from the page context path (not the querystring) the platform selector dropdown will be hidden.

- Similar to `PlatformSection`, you can embed content in the block which will render _before_ the given include, but only when an include is available.

- A file named `_default` will be used if no other content matches.

Note: This currently causes issues with tableOfContents generation, so its recommended to disable the TOC when using it.

### PlatformSection

Render a section based on the currently selected `platform` in context.  When the platform is not valid, the content will be hidden.

Attributes:

- `platform` (string) - defaults to the `platform` value from the page context or querystring
- `supported` (string[])
- `notSupported` (string[])

```javascript
<PlatformSection notSupported={["javascript", "node"]}><markdown>

Something that applies to all platforms, but not javascript or node.

</PlatformSection></ConfigKey>
```

Note: This currently causes issues with tableOfContents generation, so its recommended to disable the TOC when using it.

### PlatformRedirectLink

Useful for linking to platform-specific content when there's not a specific platform already selected.

```javascript

<PlatformRedirectLink to="/enriching-error-data/" />
```

This will direct them to a page where they can choose the platform, and then to the appropriate link.

## Linting

We use prettier to format our code. Run prettier if you get linting errors in CI.

```bash
yarn prettier:fix
```

If you want to run prettier on mdx and markdown files, run

```bash
yarn prettier:fix:all
```
