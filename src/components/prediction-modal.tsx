import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Match } from "@/lib/types";
import { PHASE_MULTIPLIER, PHASE_LABELS } from "@/lib/types";
import { formatMatchDate, phaseLabelFor } from "@/lib/format";
import { upsertPrediction } from "@/lib/api";

interface Props {
  match: Match | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: () => void;
}

export function PredictionModal({ match, open, onOpenChange, onSaved }: Props) {
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (match) {
      setHome(match.my_prediction?.predicted_home ?? 0);
      setAway(match.my_prediction?.predicted_away ?? 0);
    }
  }, [match]);

  if (!match) return null;

  const kickoff = new Date(match.match_date).getTime();
  const locked = match.status !== "upcoming" || kickoff <= Date.now();
  const mult = PHASE_MULTIPLIER[match.phase];
  const isEdit = !!match.my_prediction;

  const doSave = async () => {
    setSaving(true);
    try {
      await upsertPrediction({
        match_id: match.id,
        predicted_home: home,
        predicted_away: away,
      });
      toast.success(isEdit ? "Pronóstico actualizado" : "Pronóstico guardado");
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (isEdit) setConfirmOpen(true);
    else doSave();
  };

  const clamp = (n: number) => Math.max(0, Math.min(20, Math.round(n || 0)));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {isEdit ? "Editar pronóstico" : "Predecir partido"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {phaseLabelFor(match)} · {formatMatchDate(match.match_date)}
            </p>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-border bg-background/60 p-4">
            <div className="text-center">
              <div className="text-3xl">{match.home_team.flag_emoji}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {match.home_team.name}
              </div>
              <input
                type="number"
                min={0}
                max={20}
                value={home}
                disabled={locked}
                onChange={(e) => setHome(clamp(parseInt(e.target.value, 10)))}
                className="mt-3 h-14 w-full rounded-lg border border-border bg-card text-center font-display text-3xl font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              />
            </div>
            <div className="font-display text-2xl text-muted-foreground">vs</div>
            <div className="text-center">
              <div className="text-3xl">{match.away_team.flag_emoji}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {match.away_team.name}
              </div>
              <input
                type="number"
                min={0}
                max={20}
                value={away}
                disabled={locked}
                onChange={(e) => setAway(clamp(parseInt(e.target.value, 10)))}
                className="mt-3 h-14 w-full rounded-lg border border-border bg-card text-center font-display text-3xl font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              />
            </div>
          </div>

          {locked ? (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Este partido ya comenzó. No se puede predecir.
            </div>
          ) : (
            <div className="mt-4 space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
              <p className="font-semibold text-primary">
                Puntos si aciertas ({PHASE_LABELS[match.phase]} · ×{mult}):
              </p>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                <span>Marcador exacto</span>
                <span className="text-right font-semibold text-gold">
                  {Math.round(5 * mult)} pts
                </span>
                <span>Ganador + diferencia</span>
                <span className="text-right font-semibold text-foreground">
                  {Math.round(4 * mult)} pts
                </span>
                <span>Solo ganador / empate</span>
                <span className="text-right font-semibold text-foreground">
                  {Math.round(2 * mult)} pts
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={locked || saving}
              className="shadow-glow"
            >
              {saving ? "Guardando…" : "Guardar pronóstico"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Sobrescribir pronóstico?</AlertDialogTitle>
            <AlertDialogDescription>
              Ya tenías un pronóstico para este partido. Se reemplazará por el nuevo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doSave}>Sí, reemplazar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
