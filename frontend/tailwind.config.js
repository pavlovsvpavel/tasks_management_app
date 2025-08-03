/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                "ubuntu-normal": ['ubuntu-normal'],
                "ubuntu-bold": ['ubuntu-bold'],
                "ubuntu-semibold": ['ubuntu-semibold'],
                "ubuntu-light": ['ubuntu-light'],
                "ubuntu-italic": ['ubuntu-italic'],
            },
        },
    },
    plugins: [],
};

