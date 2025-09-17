import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";

import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface Recharge {
  Date: string;
  Utilisateur: string;
  "Carte RFID": string | null;
  Litre: number;
  Telephone: string;
  Moyen: string;
}

export function JournauxView() {
  const [allRecharges, setAllRecharges] = useState<Recharge[]>([]);
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  // Filtres
  const [searchUtilisateur, setSearchUtilisateur] = useState<string>("");
  const [searchTelephone, setSearchTelephone] = useState<string>("");
  const [moyenFilter, setMoyenFilter] = useState<string>("");

  // Menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecharge, setSelectedRecharge] = useState<Recharge | null>(null);

  // Dialog pour voir les détails
  const [openDialog, setOpenDialog] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, recharge: Recharge) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecharge(recharge);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Charger les recharges
  const fetchRecharges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://safimayi-backend.onrender.com/api/litrages/all-recharges/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAllRecharges(response.data);
      setRecharges(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des recharges :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecharges();
  }, []);

  // Filtrage local
  useEffect(() => {
    let filtered = [...allRecharges];

    if (searchUtilisateur) {
      filtered = filtered.filter((r) =>
        r.Utilisateur.toLowerCase().includes(searchUtilisateur.toLowerCase())
      );
    }
    if (searchTelephone) {
      filtered = filtered.filter((r) =>
        r.Telephone.toLowerCase().includes(searchTelephone.toLowerCase())
      );
    }
    if (moyenFilter) {
      filtered = filtered.filter((r) =>
        r.Moyen.toLowerCase() === moyenFilter.toLowerCase()
      );
    }

    setRecharges(filtered);
    setPage(1);
  }, [searchUtilisateur, searchTelephone, moyenFilter, allRecharges]);

  // Pagination locale
  const paginatedData = recharges.slice((page - 1) * pageSize, page * pageSize);

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Historique des Recharges
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="solar:restart-bold" />}
          onClick={fetchRecharges}
        >
          Actualiser
        </Button>
      </Box>
      
      {/* Filtres */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Utilisateur"
            value={searchUtilisateur}
            onChange={(e) => setSearchUtilisateur(e.target.value)}
            size="small"
          />
          <TextField
            label="Téléphone"
            value={searchTelephone}
            onChange={(e) => setSearchTelephone(e.target.value)}
            size="small"
          />
          <Select
            value={moyenFilter}
            onChange={(e) => setMoyenFilter(e.target.value)}
            displayEmpty
            size="small"
          >
            <MenuItem value="">Tous les moyens</MenuItem>
            <MenuItem value="mobile">Mobile</MenuItem>
            <MenuItem value="carte">Carte RFID</MenuItem>
          </Select>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchUtilisateur("");
              setSearchTelephone("");
              setMoyenFilter("");
            }}
          >
            Réinitialiser
          </Button>
        </Box>
      </Card>

      {/* Tableau */}
      <Card>
        <div className="p-4 bg-white shadow-md rounded-md overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <CircularProgress />
            </div>
          ) : (
            <>
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm">
                    <th className="p-2 border-b">Date</th>
                    <th className="p-2 border-b">Utilisateur</th>
                    <th className="p-2 border-b">Téléphone</th>
                    <th className="p-2 border-b">Carte RFID</th>
                    <th className="p-2 border-b">Litres</th>
                    <th className="p-2 border-b">Moyen</th>
                    <th className="p-2 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((recharge, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 border-b">{formatDate(recharge.Date)}</td>
                        <td className="p-2 border-b">{recharge.Utilisateur}</td>
                        <td className="p-2 border-b">{recharge.Telephone}</td>
                        <td className="p-2 border-b">{recharge["Carte RFID"] || "-"}</td>
                        <td className="p-2 border-b">{recharge.Litre.toFixed(1)} L</td>
                        <td className="p-2 border-b">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            {recharge.Moyen}
                          </span>
                        </td>
                        <td className="p-2 border-b text-center">
                          <IconButton onClick={(e) => handleMenuOpen(e, recharge)}>
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-500 py-6">
                        Aucune recharge trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography variant="body2">
                  {`Affichage de ${paginatedData.length} sur ${recharges.length} recharges`}
                </Typography>
                <Pagination
                  count={Math.ceil(recharges.length / pageSize)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </div>
      </Card>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuList>
          <MenuItemMui
            onClick={() => {
              setSelectedRecharge(selectedRecharge);
              setOpenDialog(true);
              handleMenuClose();
            }}
          >
            Voir les détails
          </MenuItemMui>
        </MenuList>
      </Menu>

      {/* Dialog Détails */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Détails de la recharge
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {selectedRecharge && (
            <>
              <Typography><strong>Date:</strong> {formatDate(selectedRecharge.Date)}</Typography>
              <Typography><strong>Utilisateur:</strong> {selectedRecharge.Utilisateur}</Typography>
              <Typography><strong>Téléphone:</strong> {selectedRecharge.Telephone}</Typography>
              <Typography><strong>Carte RFID:</strong> {selectedRecharge["Carte RFID"] || "Non utilisée"}</Typography>
              <Typography><strong>Litres:</strong> {selectedRecharge.Litre.toFixed(1)} L</Typography>
              <Typography><strong>Moyen de paiement:</strong> {selectedRecharge.Moyen}</Typography>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}