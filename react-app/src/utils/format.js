export const money = amount => `Bs ${amount.toFixed(2)}`
export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export const photoUrl = photo => `${import.meta.env.BASE_URL}images/${photo}.webp`
