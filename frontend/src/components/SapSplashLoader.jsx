import React, { useEffect } from 'react';
import { Database } from 'lucide-react';

export function SapSplashLoader({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000); // 2-second realistic connection delay
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="sap-splash-overlay">
      <div className="sap-splash-box">
        <div className="sap-icon-circle">
          <Database size={28} />
        </div>
        <h3>SAP NetWeaver Gateway</h3>
        <p>Connecting to OData Service <code>ZEMPLOYEE_SRV_SRV</code>...</p>
        <div className="sap-loader-spinner" />
      </div>
    </div>
  );
}
