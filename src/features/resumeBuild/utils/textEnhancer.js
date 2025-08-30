import nlp from "compromise";
import nspell from "nspell";
import dictionary from "dictionary-en";

export async function enhanceText(text, type = "generic") {
  return new Promise((resolve, reject) => {
    dictionary((err, dict) => {
      if (err) return reject(err);

      const spell = nspell(dict);

      // 1. Correct spelling
      const words = text.split(/\s+/).map((word) => {
        if (!spell.correct(word)) {
          const suggestions = spell.suggest(word);
          return suggestions.length > 0 ? suggestions[0] : word;
        }
        return word;
      });

      let corrected = words.join(" ");

      // 2. Enhance summary (basic heuristics per type/domain)
      let enhanced = corrected;

      if (type === "summary") {
        enhanced =
          corrected +
          " Passionate about leveraging skills to drive innovation and deliver impactful results.";
      } else if (type === "developer") {
        enhanced =
          corrected +
          " Skilled in modern software development, problem-solving, and writing clean, efficient code.";
      } else if (type === "designer") {
        enhanced =
          corrected +
          " Adept at creating intuitive designs that blend aesthetics with functionality.";
      } else if (type === "generic") {
        enhanced =
          corrected +
          " Highly motivated professional with a focus on growth and excellence.";
      }

      resolve(enhanced);
    });
  });
}
