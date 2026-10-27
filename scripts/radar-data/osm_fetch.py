"""Fetch the bits of OpenStreetMap a city map needs, one cached JSON per city.

Run from anywhere: python3 osm_fetch.py [city ...]   (no args = all cities)
The raw extracts (~100 MB) are cached in .osm-cache/ next to this file; only
the simplified result (src/data/cityMaps.ts, built by osm_build.py) ships.
"""
import json, os, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '.osm-cache')
os.makedirs(CACHE, exist_ok=True)

# id: (name, south, west, north, east)
CITIES = {
    'london': ('London', 51.455, -0.255, 51.560, 0.025),
    'newyork': ('New York', 40.680, -74.030, 40.825, -73.900),
    'paris': ('Paris', 48.810, 2.235, 48.910, 2.430),
    'losangeles': ('Los Angeles', 33.990, -118.510, 34.110, -118.200),
    'miami': ('Miami', 25.750, -80.230, 25.835, -80.115),
    'hongkong': ('Hong Kong', 22.255, 114.125, 22.335, 114.225),
    'seoul': ('Seoul', 37.490, 126.930, 37.600, 127.080),
    'berlin': ('Berlin', 52.470, 13.290, 52.560, 13.480),
    'amsterdam': ('Amsterdam', 52.330, 4.840, 52.395, 4.960),
    'basel': ('Basel', 47.530, 7.550, 47.600, 7.680),
    'shanghai': ('Shanghai', 31.160, 121.420, 31.260, 121.530),
    'madrid': ('Madrid', 40.385, -3.735, 40.475, -3.595),
    'venice': ('Venice', 45.420, 12.295, 45.455, 12.375),
}

# Main and secondary streets (the network that makes a map read as a map),
# water, coastline and parks. Geometry inline, so no second request.
QUERY = """[out:json][timeout:180];
(
  way["highway"~"^(motorway|trunk|primary|secondary)$"]({b});
  way["waterway"~"^(river|canal)$"]({b});
  way["natural"="water"]({b});
  relation["natural"="water"]({b});
  way["natural"="coastline"]({b});
  way["leisure"="park"]({b});
);
out geom;"""

ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']


def fetch(cid):
    path = os.path.join(CACHE, f'{cid}.json')
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return 'cached'
    _, s, w, n, e = CITIES[cid]
    q = QUERY.format(b=f'{s},{w},{n},{e}')
    last = None
    for attempt in range(5):
        url = ENDPOINTS[attempt % len(ENDPOINTS)]
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({'data': q}).encode(),
                                         headers={'User-Agent': 'nothing-radar-citymaps/1.0 (sandbox prototype)'})
            with urllib.request.urlopen(req, timeout=240) as r:
                body = r.read()
            json.loads(body)
            open(path, 'wb').write(body)
            return f'{len(body) // 1024} KB'
        except Exception as ex:  # rate limits and timeouts: back off and retry
            last = ex
            time.sleep(10 * (attempt + 1))
    return f'FAILED {last}'


if __name__ == '__main__':
    for cid in (sys.argv[1:] or CITIES):
        print(cid, fetch(cid), flush=True)
        time.sleep(3)
