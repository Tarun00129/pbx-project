# Importing Images, Styles, and Other Files

If you want a file to be included in `./dist`, it needs to be used somewhere either by `import`ing it, `url()`ing it or potentially some other methods.

## Images

Webpack detects when you import an image and will automatically copy it to `./dist` in the build. It will also return the dist URL to that file.

```javascript
// FooComponent.js
import foo from 'src/assets/images/foo.png';

console.log(foo);                   // The image's ./dist/ url. (<url-to>/foo.png)

const fooImgJsx = <img src={foo} />;
```

Same for SCSS `url()`'s. `foo.png` will be automatically copied over to dist and the correct `url()` path will be inserted in the build.

You must include the `~` in sass for webpack to know its an alias.

```scss
div {
    background-image: url("src/assets/images/foo.png");
}
```

## SVGs

### Inline (Recommended)

Add your svg file to `src/assets/images/inline-svgs`.

```javascript
import FooSVG from 'src/assets/images/inline-svgs/foo.svg';

// renders: <svg class="example-svg" ... />
<FooSVG className="example-svg" />
```

Renders the svg with the `<svg>` tag, but runs it through [SVGO](https://github.com/svg/svgo/) ([see config](./../svgo.config.js)). SVGO is configured to remove crud that is exported from the designers, and also removes any css classes.

You will need to style the svg yourself with CSS.

Use the `fill` property to color svgs:

```css
.example-svg {
    fill: red;
}
```

### Import SVG as-is, for `<img>` tag:

Add the svg to the `src/assets/images` folder.

```javascript
import fooSvg from 'src/assets/images/foo.svg';

// renders: <img src="/path/to/images/foo.svg" />
<img src={fooSvg} />
```

All styles will be preserved from the SVG.

Use this method when you have a "rich" svg. The svg may have many paths and cannot be styled via css easily.

Note that this method doesn't allow us to update the colors in the code, which is not recommended, but is sometimes required.

## Other Files

You can import various other file types in the exact same way as you would for Images.

List of supported filetypes at the time of writing this README:

    png, jp(e)g, gif, bmp, svg, ico, mp4, webm, mp(e)g, avi, wmv, ogg, pdf, docx, otf, eot, ttf, woff(2)

## Importing files as Raw Strings

You can also import files as raw strings. When importing this way, the file will not be copied over to `./dist` instead you will receive a string of the file's contents.

```javascript
import text from '!!raw-loader!./test.txt';
```

The key is to prefix the path with `!!raw-loader!`.
