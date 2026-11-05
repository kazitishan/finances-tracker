This folder will contain private financial information

- `router.json` lists every profile as `{ "name", "id", "current" }`. The one profile whose `current` is `true` is the one signed in; when none is, the app asks you to choose or create a profile.
- `profiles/<id>/` holds each profile's data: its `info.json` and an `uploads` folder for the images you upload.
