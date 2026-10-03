from __future__ import annotations

import json
import math
from datetime import UTC, datetime, timedelta
from pathlib import Path
import subprocess
from typing import Any

class GeonatalRuntimeError(RuntimeError):
    pass

GATE_WHEEL_START = 302.0
GATE_ORDER = (41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60)
BODIES = (("Sun","SUN"),("Earth","EARTH"),("North Node","TRUE_NODE"),("South Node","SOUTH_NODE"),("Moon","MOON"),("Mercury","MERCURY"),("Venus","VENUS"),("Mars","MARS"),("Jupiter","JUPITER"),("Saturn","SATURN"),("Uranus","URANUS"),("Neptune","NEPTUNE"),("Pluto","PLUTO"))
PERSPECTIVES = ("being","movement","evolution","design","space")

def calculate_geonatal(timestamp: str, *, latitude: float, longitude: float) -> dict[str, Any]:
    runtime = Path(__file__).resolve().parents[1] / "runtimes" / "isohuman"
    script = runtime / "dist" / "cli" / "geonatal.js"
    if script.exists():
        try:
            completed = subprocess.run(["node", str(script), timestamp, str(latitude), str(longitude)], cwd=runtime, capture_output=True, text=True, timeout=30, check=False)
            if completed.returncode == 0:
                payload = json.loads(completed.stdout)
                if isinstance(payload, dict):
                    payload.setdefault("methods", {})["runtime"] = "isohuman-node"
                    return payload
        except (FileNotFoundError, subprocess.TimeoutExpired, json.JSONDecodeError):
            pass
    try:
        return _calculate_swisseph(timestamp, latitude, longitude)
    except Exception as exc:
        raise GeonatalRuntimeError(f"Local geonatal calculation failed: {exc}") from exc

def _calculate_swisseph(timestamp: str, latitude: float, longitude: float) -> dict[str, Any]:
    import swisseph as swe
    _validate(latitude, longitude)
    dt=_parse(timestamp); natal_sun=_lon(swe,swe.SUN,dt); design=_design_time(swe,dt,natal_sun)
    node=_lon(swe,swe.TRUE_NODE,dt); aya=_aya(swe,dt); placements=[]
    for orientation,moment in (("personality",dt),("design",design)):
        mnode=_lon(swe,swe.TRUE_NODE,moment); sun=_lon(swe,swe.SUN,moment); maya=_aya(swe,moment); asc=_asc(swe,moment,latitude,longitude)
        for planetary,body_name in BODIES:
            if body_name=="EARTH": tropical=_norm(sun+180)
            elif body_name=="SOUTH_NODE": tropical=_norm(mnode+180)
            else: tropical=_lon(swe,getattr(swe,body_name),moment)
            for frame in ("tropical","sidereal_fagan_bradley","draconic_tropical_true"):
                flon=tropical if frame=="tropical" else (_norm(tropical-maya) if frame=="sidereal_fagan_bradley" else _norm(tropical-mnode))
                placements.append(_placement(planetary,frame,orientation,flon,asc))
    perspectives={p:[{**x,"dimension":p} for x in placements] for p in PERSPECTIVES}
    return {"timestamp":dt.isoformat().replace("+00:00","Z"),"designTimestamp":design.isoformat().replace("+00:00","Z"),"location":{"latitude":latitude,"longitude":longitude},"houseMethod":"equal","trueNodeLongitude":node,"faganBradleyAyanamsa":aya,"placements":placements,"perspectives":perspectives,"methods":{"runtime":"pyswisseph-local-fallback","ephemeris":"PySwissEph geocentric ecliptic longitude","sidereal":"Fagan-Bradley ayanamsa from Swiss Ephemeris","draconic":"tropical longitude minus true ascending lunar node","design":"timestamp solved at 88 degrees of prior solar longitude","houses":"equal houses from Swiss Ephemeris ascendant"}}

def _parse(v):
    d=datetime.fromisoformat(v.strip().replace("Z","+00:00")); return (d if d.tzinfo else d.replace(tzinfo=UTC)).astimezone(UTC)
def _jd(swe,d):
    h=d.hour+d.minute/60+(d.second+d.microsecond/1e6)/3600; return swe.julday(d.year,d.month,d.day,h,swe.GREG_CAL)
def _lon(swe,b,d): return _norm(float(swe.calc_ut(_jd(swe,d),b,swe.FLG_SWIEPH|swe.FLG_SPEED)[0][0]))
def _aya(swe,d): swe.set_sid_mode(swe.SIDM_FAGAN_BRADLEY); return _norm(float(swe.get_ayanamsa_ut(_jd(swe,d))))
def _design_time(swe,natal,natal_sun):
    lo,hi=70.0,110.0
    for _ in range(64):
        days=(lo+hi)/2; c=natal-timedelta(days=days); sep=_norm(natal_sun-_lon(swe,swe.SUN,c)); lo,hi=(days,hi) if sep<88 else (lo,days)
    return natal-timedelta(days=(lo+hi)/2)
def _asc(swe,d,lat,lon): return _norm(float(swe.houses_ex(_jd(swe,d),lat,lon,b"E")[1][0]))
def _hd(lon):
    angle=_norm(lon-GATE_WHEEL_START); idx=min(63,int(angle//5.625)); rem=angle%5.625; line=min(6,int(rem//.9375)+1); rem%=.9375; color=min(6,int(rem//.15625)+1); rem%=.15625; tu=.15625/6; tone=min(6,int(rem//tu)+1); rem%=tu; base=min(5,int(rem//(tu/5))+1); return {"gate":GATE_ORDER[idx],"line":line,"color":color,"tone":tone,"base":base}
def _placement(planetary,frame,orientation,lon,asc):
    n=_norm(lon); z=int(n//30)+1; within=n%30; deg=int(within); mf=(within-deg)*60; minute=int(mf); sf=(mf-minute)*60; sec=int(sf); arc=min(99,int((sf-sec)*100)); house=int(_norm(n-asc)//30)+1
    return {"planetary":planetary,"dimension":"being","frame":frame,"orientation":orientation,"longitude":n,"zodiac":z,"degree":deg,"minute":minute,"second":sec,"arc":arc,"house":house,"ascendingSide":house,**_hd(n)}
def _validate(lat,lon):
    if not math.isfinite(lat) or not -90<=lat<=90: raise ValueError("Latitude must be between -90 and 90 degrees")
    if not math.isfinite(lon) or not -180<=lon<=180: raise ValueError("Longitude must be between -180 and 180 degrees")
def _norm(v): return v%360.0
