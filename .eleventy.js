const { minify: minifyHtml } = require("html-minifier-terser");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");

  eleventyConfig.addFilter("ymd", (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 10);
  });

  // 只在正式 build 時壓縮 HTML（本機 npm run dev 預覽時保留原樣，方便除錯）
  eleventyConfig.addTransform("htmlmin", async function (content) {
    if (process.env.ELEVENTY_RUN_MODE === "build" && this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      return minifyHtml(content, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
      });
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
