import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getCurrencySymbol, formatCurrency } from '@/lib/currency';

export const useCurrency = () => {
    const { data: session } = useSession();
    const [actualCurrency, setActualCurrency] = useState<string>(session?.user?.currency || 'USD');

    // Fetch the actual currency from the database to ensure consistency
    useEffect(() => {
        const fetchActualCurrency = async () => {
            if (session?.user) {
                try {
                    const response = await fetch('/api/user/currency');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.currency && data.currency !== actualCurrency) {
                            setActualCurrency(data.currency);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching currency:', error);
                }
            }
        };

        fetchActualCurrency();
    }, [session?.user, actualCurrency]);

    // Use the actual currency from DB, fallback to session, then USD
    const userCurrency = actualCurrency || session?.user?.currency || 'USD';

    return {
        currency: userCurrency,
        symbol: getCurrencySymbol(userCurrency),
        format: (amount: number) => formatCurrency(amount, userCurrency),
    };
};