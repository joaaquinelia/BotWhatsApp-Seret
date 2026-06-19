export const DOMAIN_SYNONYMS = {
  termica: [
    'termica',
    'termomagnetico',
    'termico',
    'interruptor',
    'llave termica',
    'disyuntor',
  ],
  termomagnetico: [
    'termomagnetico',
    'termica',
    'termico',
    'interruptor',
    'disyuntor',
  ],
  termico: ['termico', 'termica', 'termomagnetico', 'interruptor', 'disyuntor'],
  interruptor: [
    'interruptor',
    'termomagnetico',
    'termica',
    'disyuntor',
    'diferencial',
    'interruptor diferencial',
  ],
  disyuntor: [
    'disyuntor',
    'interruptor diferencial',
    'diferencial',
    'termomagnetico',
    'termica',
    'interruptor',
    'proteccion diferencial',
  ],
  diferencial: [
    'diferencial',
    'interruptor diferencial',
    'disyuntor diferencial',
    'disyuntor',
    'proteccion diferencial',
  ],
  llave: ['llave termica', 'llave termomagnetica', 'termica', 'termomagnetico'],
  cable: ['cable', 'cables', 'conductor', 'unipolar', 'subterraneo'],
  cinta: ['cinta', 'aislante', 'aisladora'],
  zocalo: ['zocalo', 'enchufe', 'toma'],
  enchufe: ['enchufe', 'zocalo', 'toma'],
  prensacable: ['prensacable', 'prensa cable', 'pg'],
  terminales: ['terminal', 'terminales', 'puntera'],
  caja: ['caja', 'cajetin', 'cajetin'],
}

export const SEARCH_LIMIT = 15
export const SEARCH_POOL_LIMIT = 500
export const MIN_SPECIFIC_SCORE = 15
