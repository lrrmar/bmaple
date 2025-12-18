

function speed(x: number) {

  // Breakpoints (x values)
  const breaks = [500, 10000, 20000, 30000, 35000];

  // Cubic coefficients per interval: [a, b, c, d]
  // For f(x) = a*dx^3 + b*dx^2 + c*dx + d   with dx = x - breaks[i]
  const coeffs = [
    [
      -2.8325661799928977e-10, -2.321333914563701e-20, 0.3285714285714287,
      21000.0,
    ],
    [1.1606648199445977e-9, -4.036406806489902e-6, 0.2823308270676691, 24000.0],
    [-1.1887613771270277e-9, 1.3373565492679063e-5, 0.5257024139295607, 27000.0],
    [5.943806885635138e-10, -4.457855164226354e-6, 0.6148595172140878, 33000.0],
  ];

  // Find interval
  let i = breaks.length - 2;
  for (let j = 0; j < breaks.length - 1; j++) {
    if (x >= breaks[j] && x <= breaks[j + 1]) {
      i = j;
      break;
    }
  }

  const [a, b, c, d] = coeffs[i];
  const dx = x - breaks[i];

  // Horner's method
  return ((a * dx + b) * dx + c) * dx + d;
}

export const maximumHorizontalDistance = (z: number, t: number, z0: number, t0: number): number => {
  //if (t <= t0) return 0; We are now travelling back in time...
  // WIll need to find a better way to do the inverse here but it should be okay
  // as speed is bijective in the domain we are interested.
  const s = (speed(z) + speed(z0)) / 2;
  return s * Math.abs(t - t0 - Math.abs(z - z0) / 1000);
};

const horizontalDistance = (lat0: number, lon0: number, lat1: number, lon1: number) => {
  // https://www.movable-type.co.uk/scripts/latlong.html
  
  const R = 6371e3 * 3.28084; // metres to feet
  const phi0 = lat0 * Math.PI/180; // phi, lam in radians
  const phi1 = lat1 * Math.PI/180;
  const d_phi = (lat1-lat0) * Math.PI/180;
  const d_lam = (lon1-lon0) * Math.PI/180;
  
  const a = Math.sin(d_phi/2) * Math.sin(d_phi/2) +
            Math.cos(phi0) * Math.cos(phi1) *
            Math.sin(d_lam/2) * Math.sin(d_lam/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  const d = R * c; // in feet
  return d

}
