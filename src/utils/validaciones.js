
export function correoValido(correo) {
  const regex = /^[\w.-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
  return regex.test(correo);
}

export function validarRUN(run) {
  run = run.toUpperCase().trim();
  if (!/^[0-9]{7,8}[0-9K]$/.test(run)) return false;

  let cuerpo = run.slice(0, -1);
  let dv = run.slice(-1);

  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += multiplo * parseInt(cuerpo.charAt(i));
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  let dvEsperado = 11 - (suma % 11);
  let dvCalc = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

  return dv === dvCalc;
}