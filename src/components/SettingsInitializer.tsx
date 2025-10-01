import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { supabase } from '@/integrations/supabase/client';

interface SettingsInitializerProps {
  children: React.ReactNode;
}

const SettingsInitializer = ({ children }: SettingsInitializerProps) => {
  const { updateSettings } = useAppStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initializeSettings = async () => {
      console.log('🔄 Initializing settings from database...');
      
      const { data, error } = await supabase
        .from('gateway_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        const dbSettings = {
          chainId: data.chain_id,
          tokenAddress: data.token_address,
          priceWei: data.price_wei,
          gatedRoutes: data.gated_routes,
          allowlist: data.allowlist,
          protectionEnabled: data.protection_enabled,
        };
        
        console.log('✅ Settings loaded from database:', dbSettings);
        updateSettings(dbSettings);
      } else if (error) {
        console.error('❌ Failed to load settings:', error);
      }
      
      setIsLoaded(true);
    };

    initializeSettings();
  }, [updateSettings]);

  // Show nothing until settings are loaded to prevent flash of wrong state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SettingsInitializer;
