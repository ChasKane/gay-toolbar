import React, { useEffect, useRef, useState } from "react";
import SettingsHeader from "./SettingsHeader";

const MURAKAMI_QUOTE = `Sometimes fate is like a small sandstorm that keeps changing directions. You change direction but the sandstorm chases you. You turn again, but the storm adjusts. Over and over you play this out, like some ominous dance with death just before dawn. Why? Because this storm isn't something that blew in from far away, something that has nothing to do with you. This storm is you. Something inside of you. So all you can do is give in to it, step right inside the storm, closing your eyes and plugging up your ears so the sand doesn't get in, and walk through it, step by step. There's no sun there, no moon, no direction, no sense of time. Just fine white sand swirling up into the sky like pulverized bones. That's the kind of sandstorm you need to imagine.

And you really will have to make it through that violent, metaphysical, symbolic storm. No matter how metaphysical or symbolic it might be, make no mistake about it: it will cut through flesh like a thousand razor blades. People will bleed there, and you will bleed too. Hot, red blood. You'll catch that blood in your hands, your own blood and the blood of others.

And once the storm is over you won't remember how you made it through, how you managed to survive. You won't even be sure, in fact, whether the storm is really over. But one thing is certain. When you come out of the storm you won't be the same person who walked in. That's what this storm's all about.`;

type RestoreDefaultsProps = {
  onBack: () => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const RestoreDefaults: React.FC<RestoreDefaultsProps> = ({
  onBack,
  onConfirm,
  onCancel,
}) => {
  const quoteTextRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAutoScrolling || !quoteTextRef.current) return;
    const quoteElement = quoteTextRef.current;
    const maxScroll = quoteElement.scrollHeight - quoteElement.clientHeight;
    if (maxScroll <= 0) return;
    quoteElement.scrollTop = 0;
    scrollIntervalRef.current = window.setInterval(() => {
      if (quoteElement.scrollTop >= maxScroll) quoteElement.scrollTop = 0;
      else quoteElement.scrollTop += 0.5;
    }, 20);
    return () => {
      if (scrollIntervalRef.current) {
        window.clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [isAutoScrolling]);

  const handleQuoteInteraction = () => {
    setIsAutoScrolling(false);
    if (scrollIntervalRef.current) {
      window.clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  return (
    <>
      <SettingsHeader title="Restore Default Settings" onBack={onBack} />
      <div className="gay-settings-view-content">
        <div className="restore-defaults-content">
          <p className="warning-message">
            Are you sure you want to restore all settings to their default values?
          </p>
          <p className="warning-submessage">
            This action cannot be undone. All your customizations will be lost, except your custom commands, color palette, and saved configs file path, which will be preserved.
          </p>
          <div
            ref={quoteTextRef}
            className="murakami-quote"
            onMouseDown={handleQuoteInteraction}
            onTouchStart={handleQuoteInteraction}
            onWheel={handleQuoteInteraction}
          >
            {MURAKAMI_QUOTE}
          </div>
          <div className="quote-attribution">
            ― Haruki Murakami, <em>Kafka on the Shore</em>
          </div>
          <div className="dialog-actions">
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onConfirm} className="mod-warning">
              Restore Defaults
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestoreDefaults;
