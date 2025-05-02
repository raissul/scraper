from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import os
import downloader
import yt_dlp

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

class URLRequest(BaseModel):
    url: str

@app.post('/fetch-info')
async def fetch_info(data: URLRequest):
    try:
        info = downloader.get_info(data.url)
        formats = [
            {
                'format_id': f.get('format_id'),
                'format_note': f.get('format_note'),
                'ext': f.get('ext'),
                'filesize': f.get('filesize'),
                'url': f.get('url')
            }
            for f in info.get('formats', []) if f.get('filesize')
        ]
        return {
            'title': info.get('title'),
            'thumbnail': info.get('thumbnail'),
            'formats': formats
        }
    except yt_dlp.utils.DownloadError as e:
        return JSONResponse(status_code=400, content={'error': str(e)})

@app.get('/download')
async def download(url: str, format_id: str):
    output_template = 'downloads/%(title)s.%(ext)s'
    downloader.download_media(url, format_id, output_template)

    downloads_folder = 'downloads'
    files = os.listdir(downloads_folder)
    files.sort(key=lambda x: os.path.getctime(os.path.join(downloads_folder, x)), reverse=True)

    latest_file = os.path.join(downloads_folder, files[0])
    return FileResponse(latest_file, media_type='application/octet-stream', filename=os.path.basename(latest_file))
