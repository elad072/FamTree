import { HDate } from 'hebcal';

export function getHebrewDate(dateStr: string | null | undefined) {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        const hDate = new HDate(date);
        return hDate.renderGematriya();
    } catch (e) {
        return null;
    }
}
