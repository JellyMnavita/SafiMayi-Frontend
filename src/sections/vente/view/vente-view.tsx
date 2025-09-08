import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Card, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination
} from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface Vente {
  id: number;
  produit: string;
  quantite: number;
  prix_unitaire: string;
  montant_paye: string;
  mode_paiement: string;
  client: string;
  date_vente: string;
}

interface Stats {
  total_ventes: number;
  montant_total: number;
  ventes_especes: number;
  ventes_rfid: number;
  ventes_compteur: number;
}

export function VenteView() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Vente>>({});

  const fetchVentes = async (pageNumber = 1) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://safimayi-backend.onrender.com/api/stats-journal/?page=${pageNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVentes(res.data.results);
      setStats(res.data.stats);
      setTotalPages(Math.ceil(res.data.count / 10));
    } catch (err) {
      console.error("Erreur lors du fetch des ventes :", err);
    }
  };

  useEffect(() => {
    fetchVentes(page);
  }, [page]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`https://safimayi-backend.onrender.com/api/ventes/create/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenDialog(false);
      setFormData({});
      fetchVentes(page);
    } catch (error) {
      console.error("Erreur lors de la création :", error);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Journal des ventes</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenDialog(true)}
        >
          Nouvelle vente
        </Button>
      </Box>

      {/* Stats */}
      {stats && (
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Card sx={{ p: 2, flex: 1 }}>
            <Typography>Total ventes</Typography>
            <Typography variant="h5">{stats.total_ventes}</Typography>
          </Card>
          <Card sx={{ p: 2, flex: 1 }}>
            <Typography>Montant total</Typography>
            <Typography variant="h5">{stats.montant_total} FC</Typography>
          </Card>
          <Card sx={{ p: 2, flex: 1 }}>
            <Typography>Ventes en espèces</Typography>
            <Typography variant="h5">{stats.ventes_especes}</Typography>
          </Card>
          <Card sx={{ p: 2, flex: 1 }}>
            <Typography>Ventes par RFID</Typography>
            <Typography variant="h5">{stats.ventes_rfid}</Typography>
          </Card>
          <Card sx={{ p: 2, flex: 1 }}>
            <Typography>Ventes par Compteur</Typography>
            <Typography variant="h5">{stats.ventes_compteur}</Typography>
          </Card>
        </Box>
      )}

      {/* Tableau journal */}
      <Card sx={{ p: 2 }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="p-2 border-b">Produit</th>
              <th className="p-2 border-b">Quantité</th>
              <th className="p-2 border-b">Prix unitaire</th>
              <th className="p-2 border-b">Montant</th>
              <th className="p-2 border-b">Paiement</th>
              <th className="p-2 border-b">Client</th>
              <th className="p-2 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {ventes.length > 0 ? (
              ventes.map((v) => (
                <tr key={v.id}>
                  <td className="p-2 border-b">{v.produit}</td>
                  <td className="p-2 border-b">{v.quantite}</td>
                  <td className="p-2 border-b">{v.prix_unitaire} FC</td>
                  <td className="p-2 border-b">{v.montant_paye} FC</td>
                  <td className="p-2 border-b">{v.mode_paiement}</td>
                  <td className="p-2 border-b">{v.client}</td>
                  <td className="p-2 border-b">{new Date(v.date_vente).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-6">
                  Aucune vente trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Card>

      {/* Dialog ajout */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nouvelle vente</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Produit"
            value={formData.produit || ""}
            onChange={(e) => setFormData({ ...formData, produit: e.target.value })}
            fullWidth
          />
          <TextField
            label="Quantité"
            type="number"
            value={formData.quantite || ""}
            onChange={(e) => setFormData({ ...formData, quantite: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Prix unitaire"
            type="number"
            value={formData.prix_unitaire || ""}
            onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
            fullWidth
          />
          <TextField
            label="Mode de paiement"
            value={formData.mode_paiement || ""}
            onChange={(e) => setFormData({ ...formData, mode_paiement: e.target.value })}
            fullWidth
          />
          <TextField
            label="Client"
            value={formData.client || ""}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
