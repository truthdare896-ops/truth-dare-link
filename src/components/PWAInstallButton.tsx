import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { motion, AnimatePresence } from "framer-motion";

export const PWAInstallButton = () => {
  const { isInstallable, installPWA } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 right-4 z-50"
      >
        <Button
          onClick={installPWA}
          className="bg-gradient-to-r from-primary to-accent glow-effect shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Install App
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};
