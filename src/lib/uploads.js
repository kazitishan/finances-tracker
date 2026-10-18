import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// The only files uploads are allowed to touch: a PNG or JPEG directly inside one of the uploads folders.
const UPLOAD_PATH = /^\/(banks|investment|loans|subscriptions|insurance|insurance\/health)\/uploads\/[a-z0-9-]+\.(png|jpg)$/;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

function slugify(name) {
    return (name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
}

// A logo chosen in a form but not saved yet arrives as a data URL; saved ones are paths under /public.
export function isPendingUpload(value) {
    return typeof value === "string" && value.startsWith("data:");
}

// Writes a PNG or JPEG data URL to public/<folder>/uploads and returns its public path.
// The file type is checked from its contents, not just the data URL's label.
export function saveUpload(folder, name, dataUrl) {
    const match = /^data:image\/(png|jpeg);base64,(.+)$/.exec(dataUrl);
    if (!match) throw new Error("Only PNG and JPEG images can be uploaded");

    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > MAX_UPLOAD_BYTES) throw new Error("Image is too large");
    const extension = bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ? "png"
        : bytes.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE) ? "jpg"
        : null;
    if (!extension) throw new Error("Only PNG and JPEG images can be uploaded");

    const publicPath = `/${folder}/uploads/${slugify(name) || "logo"}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    if (!UPLOAD_PATH.test(publicPath)) throw new Error(`Unknown upload folder: ${folder}`);

    fs.mkdirSync(path.dirname(path.join(PUBLIC_DIR, publicPath)), { recursive: true });
    fs.writeFileSync(path.join(PUBLIC_DIR, publicPath), bytes);
    return publicPath;
}

// Removes an uploaded image. Anything that isn't one (a built-in logo, an empty value) is left alone.
export function deleteUpload(publicPath) {
    if (!UPLOAD_PATH.test(publicPath || "")) return;
    fs.rmSync(path.join(PUBLIC_DIR, publicPath), { force: true });
}
