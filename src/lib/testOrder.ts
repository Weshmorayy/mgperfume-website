/**
 * Reconnaître une commande de test.
 *
 * Pourquoi ce fichier existe : la suppression d'une commande n'a aucun sens
 * pour une vraie commande client (elle est la preuve de la vente et le client
 * l'a reçue par WhatsApp). Seules les commandes de test — celles que le
 * propriétaire fabrique pour vérifier le tunnel de commande, les frais de
 * livraison ou l'affichage du tableau de bord — doivent pouvoir disparaître.
 * On ne se fie donc pas au bouton de l'interface : la règle vit ici, dans une
 * fonction partagée par l'admin et le StoreContext.
 *
 * Règle du « mot entier » : « test » doit apparaître comme un mot autonome.
 * « Testament », « contestataire » ou « testeur » ne matchent PAS. C'est
 * volontaire : un client nommé « Testamou » ne doit pas être effaçable.
 *
 * Le repli des accents (`normalize('NFD')` + retrait des diacritiques) permet
 * de reconnaître « Test », « TEST » et « test » de la même façon — le
 * propriétaire tape ses commandes de test sans se soucier de la casse.
 *
 * Le regex n'a PAS le drapeau `g`, et c'est important : avec ce drapeau,
 * `lastIndex` est conservé d'un appel à l'autre. Le même `TEST_WORD.test(...)`
 * renverrait alors alternativement vrai et faux selon l'appel précédent, donc
 * un bouton de suppression qui apparaît une fois sur deux. Sans `g`, chaque
 * appel repart de zéro.
 *
 * Piège déjà rencontré sur le projet frère (Continental) : une première garde
 * posée directement en base testait un `LIKE '% test %'`, qui exige une espace
 * avant ET après le mot. Une commande dont le champ commençait ou finissait
 * par « test » (ou « test » tout seul) passait donc entre les mailles. Ce
 * regex « mot entier » est l'implémentation de référence : garder les deux
 * projets identiques, sinon les deux admins ne se comportent plus pareil.
 */

// Drapeau `g` volontairement absent — voir l'explication ci-dessus.
const TEST_WORD = /(^|[^a-z0-9])test([^a-z0-9]|$)/

// Normalise pour comparer : sans accents et en minuscules.
function normalise(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function isTestOrder(order: { customer_name?: string | null; notes?: string | null }): boolean {
  return TEST_WORD.test(normalise(order.customer_name ?? '')) || TEST_WORD.test(normalise(order.notes ?? ''))
}
