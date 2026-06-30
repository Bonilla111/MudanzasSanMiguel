/* ============================================
   TRASTEOS Y MUDANZAS SAN MIGUEL - main.js
   ============================================ */

var LIMITE_EXPRESS = 4; // máximo de objetos permitidos en servicio exprés

// ---- NAVBAR ----
var navbar   = document.getElementById('navbar');
var burger   = document.getElementById('burgerBtn');
var navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', function () {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

burger.addEventListener('click', function () {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---- SCROLL ANIMATIONS ----
var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('[data-animate]').forEach(function (el) { observer.observe(el); });

// ---- FAQ ----
document.querySelectorAll('.faq-q').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
      var a = b.nextElementSibling;
      if (a) a.classList.remove('open');
    });
    if (!open) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }
  });
});

// ---- MIN DATE ----
var fechaInput = document.getElementById('fecha');
if (fechaInput) fechaInput.setAttribute('min', new Date().toISOString().split('T')[0]);

// ---- HORARIO: mostrar hora específica ----
var horarioSel         = document.getElementById('horario');
var horaEspecificaWrap = document.getElementById('horaEspecificaWrap');
var horaEspecifica     = document.getElementById('horaEspecifica');

horarioSel.addEventListener('change', function () {
  var show = this.value === 'otro';
  horaEspecificaWrap.style.display = show ? 'flex' : 'none';
  if (!show) horaEspecifica.value = '';
});

// ---- AYUDANTES: mostrar cantidad ----
var soloTransporte    = document.getElementById('soloTransporte');
var cantAyudantesWrap = document.getElementById('cantAyudantesWrap');
var cantAyudantes     = document.getElementById('cantAyudantes');

soloTransporte.addEventListener('change', function () {
  var show = this.value === 'no';
  cantAyudantesWrap.style.display = show ? 'flex' : 'none';
  if (!show) cantAyudantes.value = '';
});

// ====================================================
// SERVICIO EXPRÉS: límite de objetos (4 máximo)
// ====================================================
var tipoServicioSel  = document.getElementById('tipoServicio');
var expressAlert     = document.getElementById('expressAlert');
var inventarioContador = document.getElementById('inventarioContador');

function esExpress() {
  return tipoServicioSel.value === 'Servicio exprés';
}

function contarTotalObjetos() {
  var total = 0;
  document.querySelectorAll('.inv-input').forEach(function (input) {
    var v = parseInt(input.value, 10);
    if (v > 0) total += v;
  });
  for (var i = 1; i <= contadorObjetos; i++) {
    var el = document.getElementById('obj_' + i);
    if (!el) continue;
    var cant = parseInt(getVal('obj_cant_' + i), 10);
    total += (cant > 0 ? cant : (getVal('obj_nombre_' + i) ? 1 : 0));
  }
  return total;
}

function actualizarContadorExpress() {
  if (!esExpress()) {
    inventarioContador.style.display = 'none';
    expressAlert.style.display = 'none';
    document.getElementById('btnAgregarObjeto').disabled = false;
    return;
  }

  var total = contarTotalObjetos();
  inventarioContador.style.display = 'block';

  var claseCounter = 'inv-counter';
  if (total > LIMITE_EXPRESS) claseCounter += ' danger';
  else if (total === LIMITE_EXPRESS) claseCounter += ' warn';

  inventarioContador.innerHTML =
    '<span class="' + claseCounter + '">📦 Objetos contados: ' + total + ' / ' + LIMITE_EXPRESS + '</span>';

  var btnAgregarObj = document.getElementById('btnAgregarObjeto');

  if (total > LIMITE_EXPRESS) {
    expressAlert.className = 'form-alert warning';
    expressAlert.style.display = 'block';
    expressAlert.textContent = '⚠️ El servicio exprés tiene un máximo de ' + LIMITE_EXPRESS + ' objetos. Usted tiene ' + total + '. Por favor reduzca la cantidad o elija otro tipo de servicio.';
    btnAgregarObj.disabled = true;
  } else {
    expressAlert.style.display = 'none';
    btnAgregarObj.disabled = false;
  }
}

tipoServicioSel.addEventListener('change', actualizarContadorExpress);
document.querySelectorAll('.inv-input').forEach(function (input) {
  input.addEventListener('input', actualizarContadorExpress);
});

// ---- AGREGAR OBJETO EXTRA ----
var otrosContainer  = document.getElementById('otrosContainer');
var btnAgregarObj   = document.getElementById('btnAgregarObjeto');
var contadorObjetos = 0;

btnAgregarObj.addEventListener('click', function () {
  contadorObjetos++;
  var idx  = contadorObjetos;
  var div  = document.createElement('div');
  div.className = 'extra-obj';
  div.id = 'obj_' + idx;
  div.innerHTML =
    '<div class="fg"><label>Objeto</label><input type="text" id="obj_nombre_' + idx + '" placeholder="Ej: Piano, bicicleta..." /></div>' +
    '<div class="fg"><label>Cantidad</label><input type="number" class="obj-cant-input" id="obj_cant_' + idx + '" min="0" placeholder="0" /></div>' +
    '<button type="button" class="btn-remove" onclick="window.removerElemento(\'obj_' + idx + '\')">✕</button>';
  otrosContainer.appendChild(div);

  var cantInput = document.getElementById('obj_cant_' + idx);
  cantInput.addEventListener('input', actualizarContadorExpress);

  actualizarContadorExpress();
});

window.removerElemento = function (id) {
  var el = document.getElementById(id);
  if (el) el.remove();
  actualizarContadorExpress();
};

// ---- PARADAS ADICIONALES ----
var paradasWrap      = document.getElementById('paradasWrap');
var paradasContainer = document.getElementById('paradasContainer');
var btnAgregarParada = document.getElementById('btnAgregarParada');
var contadorParadas  = 0;

document.querySelectorAll('input[name="masViajes"]').forEach(function (r) {
  r.addEventListener('change', function () {
    paradasWrap.style.display = this.value === 'si' ? 'block' : 'none';
    if (this.value === 'no') {
      paradasContainer.innerHTML = '';
      contadorParadas = 0;
    }
  });
});

btnAgregarParada.addEventListener('click', function () {
  contadorParadas++;
  var idx = contadorParadas;
  var div = document.createElement('div');
  div.className = 'parada-item';
  div.id = 'parada_' + idx;
  div.innerHTML =
    '<div class="fg"><label>Dirección</label><input type="text" id="par_dir_' + idx + '" placeholder="Ej: Cra 5 #10-20" /></div>' +
    '<div class="fg"><label>Barrio</label><input type="text" id="par_barrio_' + idx + '" placeholder="Ej: San Antonio" /></div>' +
    '<div class="fg"><label>Ciudad</label><input type="text" id="par_ciudad_' + idx + '" placeholder="Ej: Cali" /></div>' +
    '<button type="button" class="btn-remove" onclick="window.removerElemento(\'parada_' + idx + '\')">✕</button>';
  paradasContainer.appendChild(div);
});

// ---- OCULTAR LOGO SIN SRC ----
window.addEventListener('load', function () {
  document.querySelectorAll('.navbar__logo-img, .footer__logo').forEach(function (img) {
    if (!img.getAttribute('src')) img.style.display = 'none';
  });
});

// ====================================================
// FORMULARIO → WHATSAPP
// ====================================================
var submitBtn = document.getElementById('submitBtn');
var formAlert = document.getElementById('formAlert');

function showAlert(msg, type) {
  formAlert.textContent = msg;
  formAlert.className   = 'form-alert ' + type;
  formAlert.style.display = 'block';
  formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(function () { formAlert.style.display = 'none'; }, 6000);
}

function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function markError(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('error');
}

function clearErrors() {
  document.querySelectorAll('.fg input, .fg select, .fg textarea').forEach(function (el) {
    el.classList.remove('error');
  });
}

function buildInventario() {
  var items = [
    { id: 'inv_cama_doble',    label: 'Cama doble'      },
    { id: 'inv_cama_sencilla', label: 'Cama sencilla'   },
    { id: 'inv_colchon',       label: 'Colchones'       },
    { id: 'inv_closet',        label: 'Closets'         },
    { id: 'inv_sofa',          label: 'Sofas'           },
    { id: 'inv_centro_tv',     label: 'Centro de TV'    },
    { id: 'inv_televisor',     label: 'Televisores'     },
    { id: 'inv_comedor',       label: 'Comedor'         },
    { id: 'inv_nevera',        label: 'Nevera'          },
    { id: 'inv_lavadora',      label: 'Lavadora'        },
    { id: 'inv_estufa',        label: 'Estufa'          },
    { id: 'inv_microondas',    label: 'Microondas'      },
    { id: 'inv_escritorio',    label: 'Escritorios'     },
    { id: 'inv_cajas',         label: 'Cajas'           },
    { id: 'inv_chuspas',       label: 'Chuspas/bolsas'  },
    { id: 'inv_bicicleta',     label: 'Bicicletas'      }
  ];
  var lineas = [];
  items.forEach(function (item) {
    var val = parseInt(getVal(item.id), 10);
    if (val && val > 0) lineas.push(item.label + ': ' + val);
  });
  for (var i = 1; i <= contadorObjetos; i++) {
    var el = document.getElementById('obj_' + i);
    if (!el) continue;
    var nombre = getVal('obj_nombre_' + i);
    var cant   = getVal('obj_cant_' + i);
    if (nombre) lineas.push(nombre + (cant ? ': ' + cant : ''));
  }
  return lineas.length ? lineas.join(', ') : 'No especificado';
}

function buildParadas() {
  var lineas = [];
  for (var i = 1; i <= contadorParadas; i++) {
    var el = document.getElementById('parada_' + i);
    if (!el) continue;
    var dir    = getVal('par_dir_' + i);
    var barrio = getVal('par_barrio_' + i);
    var ciudad = getVal('par_ciudad_' + i);
    if (dir || barrio || ciudad) lineas.push('Parada ' + i + ': ' + [dir, barrio, ciudad].filter(Boolean).join(', '));
  }
  return lineas;
}

function formatHorario(val, horaEsp) {
  if (val === 'manana')   return 'Manana (6am - 12pm)';
  if (val === 'tarde')    return 'Tarde (12pm - 6pm)';
  if (val === 'flexible') return 'Flexible';
  if (val === 'otro' && horaEsp) return 'Hora especifica: ' + horaEsp;
  return val || 'No especificado';
}

submitBtn.addEventListener('click', function () {
  clearErrors();

  var nombre        = getVal('nombre');
  var telefono      = getVal('telefono');
  var telefono2     = getVal('telefono2');
  var ciudadOrigen  = getVal('ciudadOrigen');
  var barrioOrigen  = getVal('barrioOrigen');
  var dirOrigen     = getVal('dirOrigen');
  var pisoOrigen    = getVal('pisoOrigen');
  var ciudadDestino = getVal('ciudadDestino');
  var barrioDestino = getVal('barrioDestino');
  var dirDestino    = getVal('dirDestino');
  var pisoDestino   = getVal('pisoDestino');
  var fecha         = getVal('fecha');
  var horario       = getVal('horario');
  var horaEsp       = getVal('horaEspecifica');
  var soloTrans     = getVal('soloTransporte');
  var cantAy        = getVal('cantAyudantes');
  var tipoServicio  = getVal('tipoServicio');
  var comentarios   = getVal('comentarios');
  var masViajes     = document.querySelector('input[name="masViajes"]:checked');
  var masViajesVal  = masViajes ? masViajes.value : 'no';

  // Validación
  var err = false;
  if (!nombre)        { markError('nombre');        err = true; }
  if (!telefono)      { markError('telefono');      err = true; }
  if (!ciudadOrigen)  { markError('ciudadOrigen');  err = true; }
  if (!barrioOrigen)  { markError('barrioOrigen');  err = true; }
  if (!dirOrigen)     { markError('dirOrigen');     err = true; }
  if (!ciudadDestino) { markError('ciudadDestino'); err = true; }
  if (!barrioDestino) { markError('barrioDestino'); err = true; }
  if (!dirDestino)    { markError('dirDestino');    err = true; }
  if (!fecha)         { markError('fecha');         err = true; }
  if (!horario)       { markError('horario');       err = true; }
  if (!tipoServicio)  { markError('tipoServicio');  err = true; }
  if (!soloTrans)     { markError('soloTransporte');err = true; }
  if (soloTrans === 'no' && !cantAy) { markError('cantAyudantes'); err = true; }
  if (horario === 'otro' && !horaEsp){ markError('horaEspecifica'); err = true; }

  // Validación servicio exprés: máximo 4 objetos
  if (esExpress()) {
    var totalObjetos = contarTotalObjetos();
    if (totalObjetos > LIMITE_EXPRESS) {
      showAlert('El servicio exprés admite máximo ' + LIMITE_EXPRESS + ' objetos. Usted tiene ' + totalObjetos + '. Reduzca la cantidad o elija otro servicio.', 'error');
      document.getElementById('inventarioContador').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  }

  if (err) {
    showAlert('Por favor complete todos los campos obligatorios (*).', 'error');
    return;
  }

  var fechaFmt = new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  var inventario = buildInventario();
  var paradasLineas = masViajesVal === 'si' ? buildParadas() : [];

  var msg = 'Hola! Solicito cotizacion con Trasteos y Mudanzas San Miguel.\n\n';

  msg += 'DATOS DE CONTACTO\n';
  msg += 'Nombre: ' + nombre + '\n';
  msg += 'Telefono principal: ' + telefono + '\n';
  if (telefono2) msg += 'Telefono alternativo: ' + telefono2 + '\n';
  msg += '\n';

  msg += 'TIPO DE SERVICIO\n';
  msg += tipoServicio + '\n';
  msg += 'Solo transporte: ' + (soloTrans === 'si' ? 'Si' : 'No, necesita ayudantes') + '\n';
  if (soloTrans === 'no' && cantAy) msg += 'Cantidad de ayudantes: ' + cantAy + '\n';
  msg += '\n';

  msg += 'ORIGEN\n';
  msg += 'Ciudad: ' + ciudadOrigen + '\n';
  msg += 'Barrio: ' + barrioOrigen + '\n';
  msg += 'Direccion: ' + dirOrigen + '\n';
  if (pisoOrigen) msg += 'Piso: ' + (pisoOrigen === '0' ? 'Casa (piso 0)' : pisoOrigen) + '\n';
  msg += '\n';

  msg += 'DESTINO\n';
  msg += 'Ciudad: ' + ciudadDestino + '\n';
  msg += 'Barrio: ' + barrioDestino + '\n';
  msg += 'Direccion: ' + dirDestino + '\n';
  if (pisoDestino) msg += 'Piso: ' + (pisoDestino === '0' ? 'Casa (piso 0)' : pisoDestino) + '\n';
  msg += '\n';

  msg += 'FECHA Y HORARIO\n';
  msg += 'Fecha: ' + fechaFmt + '\n';
  msg += 'Horario: ' + formatHorario(horario, horaEsp) + '\n\n';

  msg += 'INVENTARIO\n';
  msg += inventario + '\n\n';

  if (paradasLineas.length) {
    msg += 'PARADAS ADICIONALES\n';
    paradasLineas.forEach(function (p) { msg += p + '\n'; });
    msg += '\n';
  }

  if (comentarios) {
    msg += 'COMENTARIOS\n' + comentarios + '\n\n';
  }

  msg += 'Quedo a la espera de la cotizacion. Gracias!';

  window.open('https://wa.me/573217676571?text=' + encodeURIComponent(msg), '_blank');
  showAlert('Redirigiendo a WhatsApp! Si no abre, permita ventanas emergentes.', 'success');
});