import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname fix voor ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Laadt een JSON bestand uit de locales folder.
 */
const loadLocale = (file) => {
    try {
        const content = fs.readFileSync(path.join(__dirname, "../locales", file), "utf-8");
        return JSON.parse(content);
    } catch (err) {
        console.error(`Fout bij het laden van ${file}:`, err.message);
        return {};
    }
};

// Alle beschikbare talen in één object
export const locales = {
    nl: loadLocale("nl.json"),
    fr: loadLocale("fr.json"),
};

/**
 * Geeft een message terug op basis van taal en key
 * @param {string} lang - 'nl' of 'fr'
 * @param {string} key - de key van de message
 * @returns {string} message
 */
export const getMessage = (lang, key) => {
    const dictionary = locales[lang] || locales["nl"];
    return dictionary[key] || key;
};
