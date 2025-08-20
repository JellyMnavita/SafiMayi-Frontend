import React, { useEffect, useState } from "react";
import axios from "axios";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuList from "@mui/material/MenuList";
import MenuItemMui from "@mui/material/MenuItem";

import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface Compteur {
  id: number;
  nom: string;
  code_serie: string;
  actif: boolean;
  date_installation: string | null;
  siteforage: number;
}

export function CompteurView() {
  const [compteurs, setCompteurs] = useState<Compteur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [total, setTotal] = useState<number>(0);

  // Filtres
  const [searchNom, setSearchNom] = useState<string>("");
  const [searchCode, setSearchCode] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Menu d’action (3 points)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompteur, setSelectedCompteur] = useState<Compteur | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, compteur: Compteur) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompteur(compteur);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCompteur(null);
  };

  useEffect(() => {
    const fetchCompteurs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `https://safimayi-backend.onrender.com/api/compteur/compteurs/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page: page,
              page_size: pageSize,
              nom: searchNom || undefined,
              code_serie: searchCode || undefined,
              actif: statusFilter || undefined,
            },
          }
        );

        setCompteurs(response.data.results || response.data);
        setTotal(response.data.count || response.data.length);
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompteurs();
  }, [page, pageSize, searchNom, searchCode, statusFilter]);

  if (loading) {
    return <p className="text-center py-4">Chargement...</p>;
  }

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Compteurs
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Ajouter un compteur
        </Button>
      </Box>

      {/* Filtres */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Nom"
            value={searchNom}
            onChange={(e) => setSearchNom(e.target.value)}
            size="small"
          />
          <TextField
            label="Code série"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            size="small"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            size="small"
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="true">Actifs</MenuItem>
            <MenuItem value="false">Bannis</MenuItem>
          </Select>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchNom("");
              setSearchCode("");
              setStatusFilter("");
              setPage(1);
            }}
          >
            Réinitialiser
          </Button>
        </Box>
      </Card>

      {/* Tableau responsive */}
      <Card>
        <div className="p-4 bg-white shadow-md rounded-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Liste des Compteurs</h2>
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-2 border-b">Nom</th>
                <th className="p-2 border-b">Code série</th>
                <th className="p-2 border-b">Site forage</th>
                <th className="p-2 border-b">Date d'installation</th>
                <th className="p-2 border-b">Status</th>
                <th className="p-2 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {compteurs.map((compteur) => (
                <tr key={compteur.id} className="hover:bg-gray-50">
                  <td className="p-2 border-b">{compteur.nom}</td>
                  <td className="p-2 border-b">{compteur.code_serie}</td>
                  <td className="p-2 border-b">Site #{compteur.siteforage}</td>
                  <td className="p-2 border-b">
                    {compteur.date_installation || "-"}
                  </td>
                  <td className="p-2 border-b">
                    {compteur.actif ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Actif
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                        Banni
                      </span>
                    )}
                  </td>
                  <td className="p-2 border-b text-center">
                    <IconButton onClick={(e) => handleMenuOpen(e, compteur)}>
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  </td>
                </tr>
              ))}
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
              {`Affichage de ${compteurs.length} sur ${total} compteurs`}
            </Typography>
            <Pagination
              count={Math.ceil(total / pageSize)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </div>
      </Card>

      {/* Menu contextuel (modifier/supprimer) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          <MenuItemMui
            onClick={() => {
              console.log("Modifier", selectedCompteur);
              handleMenuClose();
            }}
          >
            Modifier
          </MenuItemMui>
          <MenuItemMui
            onClick={() => {
              console.log("Supprimer", selectedCompteur);
              handleMenuClose();
            }}
          >
            Supprimer
          </MenuItemMui>
        </MenuList>
      </Menu>
    </DashboardContent>
  );
}
