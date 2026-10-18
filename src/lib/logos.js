// The logo for the platform `name`: its built-in image when it's one of `options`, otherwise
// `customLogo`, the image uploaded when it was added through "Other".
export function logoFor(options, name, customLogo) {
    return options.find((option) => option.name === name)?.image || customLogo || undefined;
}
