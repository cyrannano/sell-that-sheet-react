# Frontend Integration Guide

This document explains how to use the API endpoints that were recently added to `sell-that-sheet`.

## CSV to XLSX Conversion

`POST /utils/rows-to-columns/`

Upload a CSV file in a `file` form field. The endpoint returns an XLSX blob named `converted.xlsx`.

Example using the helpers from `AuthContext`:

```javascript
const file = /* File object from `<input type="file" />` */;
const blob = await convertRowsToColumns(file);
// use URL.createObjectURL(blob) to trigger a download
```

## Export Allegro Products

1. `POST /allegro/export/start/` – starts a Celery task and returns `{"task_id": "<id>"}`.
2. `GET /allegro/export/download/` – download `full_catalogue.xlsx` once ready. Returns `404` while the task runs.

Call `startAllegroExport()` and poll with `downloadAllegroExport()` until a Blob is returned.

## Export Auction Data

1. `GET /auctions/export/` – starts the export task and returns `{"task_id": "<id>"}`.
2. `GET /auctions/export/download/` – download `auctions_export.xlsx` once available. Returns `404` until then.

Use `startAuctionExport()` and `downloadAuctionExport()` similarly to the Allegro helpers.
