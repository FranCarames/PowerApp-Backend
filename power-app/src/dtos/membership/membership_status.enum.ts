/**
 * Estado de la membresía de un alumno (CU-E-26 / CU-E-27).
 * Es un valor **derivado** de `Membership_Payment.expired_at` contra la fecha
 * actual, no un flag persistido: la spec lo pide explícitamente así.
 */
export enum MembershipStatus {
    /** Vigente y todavía lejos del vencimiento. */
    active = 'active',
    /** Vigente, pero vence dentro de la ventana configurada. */
    expiring_soon = 'expiring_soon',
    /** La fecha de vencimiento ya pasó. */
    expired = 'expired',
    /** El alumno no tiene ningún pago registrado. */
    no_payments = 'no_payments',
}
