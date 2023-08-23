const hljs = require("highlight.js");
const html2canvas = require("html2canvas");

const text2Image = async (text) => {
  const highlighted = hljs.highlightAuto(text).value;

  const el = document.createElement("pre");
  el.style.color = "#fff";
  el.style.backgroundColor = "#000";
  document.querySelector(".jungle-wrapper").appendChild(el);
  el.innerHTML = highlighted;

  const canvas = await html2canvas(el);

  el.remove();
  return canvas;
};

module.exports = text2Image;
