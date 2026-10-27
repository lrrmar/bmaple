# bmaple

## The Browser Map Layering Engine

test azure deploy workflow
test workflow with new web app

## Forecast dataset selection

The viewer loads `png/catalogue.json` (schema version 2) beneath the storage
container URL configured in `cumulusSlice.tsx`. The default catalogue is
<https://cumulusappstorage.blob.core.windows.net/data/png/catalogue.json>.
The storage endpoint must permit browser GET requests through CORS.

Subseasonal models, downscaling methods, variants, checkpoints and run dates
come from the catalogue. Variant and checkpoint identifiers are displayed in
full and wrap within the control panel.

For coarse Aurora data, **Aurora checkpoint** identifies the forecast model checkpoint.

For downscaled data, **Downscaling checkpoint** identifies the
downscaler configuration.

The PNG path template and image geometry come from the selected catalogue record.

Accumulation choices and the daily lead-time range remain hard-coded. An N-day accumulation starts at N \* 24 hours, with a maximum lead time of 1104 hours.
