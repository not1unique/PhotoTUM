import os
import re
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO

# ------------------ CONFIG ------------------

START_URL = "https://hack.tum.de/wp-content/uploads/2024/11/"  # <- put your link-list URL here
OUTPUT_DIR = "images_hackatum2024"
MIN_WIDTH = 1000
MIN_HEIGHT = 1000

# Optional: CSS selector for the link list container.
# If you leave this as None, it will use *all* links on the page.
LINK_LIST_SELECTOR = None
# Example if you know the structure:
# LINK_LIST_SELECTOR = "ul.link-list a"
# LINK_LIST_SELECTOR = "div.posts a"

# ------------------------------------------------

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (compatible; ImageScraper/1.0)"
})


def safe_filename(name: str) -> str:
    """Sanitize a string to be used as a filename."""
    name = re.sub(r"[\\/*?:\"<>|]", "_", name)
    # Avoid empty names
    if not name.strip():
        name = "image"
    return name


def get_soup(url: str) -> BeautifulSoup | None:
    """Download a page and return BeautifulSoup, or None on error."""
    try:
        resp = session.get(url, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"[!] Failed to fetch {url}: {e}")
        return None
    return BeautifulSoup(resp.text, "html.parser")


def get_link_urls_from_start_page(start_url: str) -> list[str]:
    """Extract a list of URLs from the link-list page."""
    print(f"[*] Fetching link list from: {start_url}")
    soup = get_soup(start_url)
    if soup is None:
        return []

    if LINK_LIST_SELECTOR:
        links = soup.select(LINK_LIST_SELECTOR)
    else:
        # Fallback: all <a> tags
        links = soup.find_all("a")

    base = start_url
    urls = []
    for a in links:
        href = a.get("href")
        if not href:
            continue
        abs_url = urljoin(base, href)
        # Optional: skip mailto/tel/etc.
        if abs_url.startswith("mailto:") or abs_url.startswith("tel:"):
            continue
        # Avoid duplicates
        if abs_url not in urls:
            urls.append(abs_url)

    print(f"[*] Found {len(urls)} link(s) on the link list page.")
    return urls


def get_image_urls_from_page(page_url: str) -> list[str]:
    """Extract all image URLs from a given page."""
    print(f"  [-] Scanning images on: {page_url}")
    soup = get_soup(page_url)
    if soup is None:
        return []

    img_tags = soup.find_all("img")
    base = page_url
    img_urls = []

    for img in img_tags:
        src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
        if not src:
            continue
        abs_img_url = urljoin(base, src)

        # Optional: Skip very obvious tiny images (icons, sprites)
        # using filename hints, not dimensions:
        if any(token in abs_img_url.lower() for token in ["sprite", "icon", "logo"]):
            pass  # comment this line if you want to include them

        if abs_img_url not in img_urls:
            img_urls.append(abs_img_url)

    print(f"    -> Found {len(img_urls)} image(s).")
    return img_urls


def image_is_big_enough(img_bytes: bytes) -> bool:
    """Check if image is larger than MIN_WIDTH x MIN_HEIGHT."""
    try:
        with Image.open(BytesIO(img_bytes)) as im:
            width, height = im.size
    except Exception as e:
        print(f"      [!] Error reading image bytes: {e}")
        return False

    big_enough = width >= MIN_WIDTH and height >= MIN_HEIGHT
    print(f"      -> Size: {width}x{height} px | {'OK' if big_enough else 'too small'}")
    return big_enough


def download_image(img_url: str, page_url: str, index: int):
    """Download an image if it meets the size requirements."""
    print(f"    [*] Checking image: {img_url}")
    try:
        resp = session.get(img_url, timeout=20, stream=True)
        resp.raise_for_status()
        img_bytes = resp.content
    except Exception as e:
        print(f"      [!] Failed to download image {img_url}: {e}")
        return

    if not image_is_big_enough(img_bytes):
        return

    # Make sure output dir exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Derive a filename
    parsed = urlparse(img_url)
    basename = os.path.basename(parsed.path)
    if not basename or "." not in basename:
        # No proper file name or extension in URL
        basename = f"img_{index}.jpg"

    name_part, ext = os.path.splitext(basename)
    if not ext:
        ext = ".jpg"

    safe_name_part = safe_filename(name_part)
    # Optionally you can include part of the page URL to group them
    page_slug = safe_filename(urlparse(page_url).path.strip("/").replace("/", "_") or "root")

    filename = f"{page_slug}_{index}_{safe_name_part}{ext}"
    filepath = os.path.join(OUTPUT_DIR, filename)

    # Save the image
    try:
        with open(filepath, "wb") as f:
            f.write(img_bytes)
        print(f"      -> Saved as: {filepath}")
    except Exception as e:
        print(f"      [!] Error saving image {filepath}: {e}")

IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff")

def is_image_url(url: str) -> bool:
    path = urlparse(url).path.lower()
    return any(path.endswith(ext) for ext in IMAGE_EXTENSIONS)

def main():
    link_urls = get_link_urls_from_start_page(START_URL)
    if not link_urls:
        print("[!] No links found on the start page. Check LINK_LIST_SELECTOR or URL.")
        return

    img_counter = 0

    for link in link_urls:
        if is_image_url(link):
            # Case 1: the link itself is an image
            img_counter += 1
            print(f"[*] Direct image link found: {link}")
            download_image(link, page_url=START_URL, index=img_counter)
        else:
            # Case 2: the link is an HTML page – scan it for images
            img_urls = get_image_urls_from_page(link)
            for img_url in img_urls:
                img_counter += 1
                download_image(img_url, page_url=link, index=img_counter)

    print(f"[*] Done. Processed approximately {img_counter} image URL(s).")

if __name__ == "__main__":
    main()
