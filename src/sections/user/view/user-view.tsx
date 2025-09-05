import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  Typography,
  TextField,
  IconButton,
  Button,
  Menu,
  MenuList,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Pagination,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface User {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  role: string;
  state: boolean;
}

export function UserView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Search + Filters
  const [searchNom, setSearchNom] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  // Menu contextuel
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Dialog (create/edit)
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  // Charger utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://safimayi-backend.onrender.com/api/users/create-list/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrage local
  const filteredUsers = users.filter(
    (u) =>
      u.nom.toLowerCase().includes(searchNom.toLowerCase()) &&
      u.email.toLowerCase().includes(searchEmail.toLowerCase()) &&
      (roleFilter ? u.role === roleFilter : true)
  );

  // Pagination locale
  const paginatedData = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Menu actions
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: User
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Save (create/update)
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (formData.id) {
        await axios.put(
          `https://safimayi-backend.onrender.com/api/users/${formData.id}/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "https://safimayi-backend.onrender.com/api/users/create-list/",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchUsers();
      setOpenDialog(false);
      setFormData({});
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Utilisateurs
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => {
            setFormData({});
            setOpenDialog(true);
          }}
        >
          Nouvel utilisateur
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
            label="Email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            size="small"
          />
          <FormControl size="small">
            <InputLabel>Rôle</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              displayEmpty
              label="Rôle"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="agent">Agent</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchNom("");
              setSearchEmail("");
              setRoleFilter("");
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
              <p className="text-gray-500">Chargement des utilisateurs...</p>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm">
                    <th className="p-2 border-b">Nom</th>
                    <th className="p-2 border-b">Email</th>
                    <th className="p-2 border-b">Téléphone</th>
                    <th className="p-2 border-b">Rôle</th>
                    <th className="p-2 border-b">Statut</th>
                    <th className="p-2 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-2 border-b">{user.nom}</td>
                        <td className="p-2 border-b">{user.email}</td>
                        <td className="p-2 border-b">{user.telephone}</td>
                        <td className="p-2 border-b capitalize">{user.role}</td>
                        <td className="p-2 border-b">
                          {user.state ? (
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
                          <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-6">
                        Aucun utilisateur trouvé
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
                  {`Affichage de ${paginatedData.length} sur ${filteredUsers.length} utilisateurs`}
                </Typography>
                <Pagination
                  count={Math.ceil(filteredUsers.length / pageSize)}
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
          <MenuItem
            onClick={() => {
              setFormData(selectedUser || {});
              setOpenDialog(true);
              handleMenuClose();
            }}
          >
            Modifier
          </MenuItem>
          <MenuItem
            onClick={() => {
              console.log("TODO: delete user", selectedUser);
              handleMenuClose();
            }}
          >
            Supprimer
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Dialog Ajout / Édition */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Modifier l’utilisateur" : "Nouvel utilisateur"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nom"
            value={formData.nom || ""}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            fullWidth
          />
          <TextField
            label="Téléphone"
            value={formData.telephone || ""}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Rôle</InputLabel>
            <Select
              value={formData.role || "client"}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="agent">Agent</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
