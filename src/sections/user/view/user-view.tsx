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
  CircularProgress,
  Grid,
  InputLabel,
  Alert,
  Snackbar
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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
  const [formData, setFormData] = useState<Partial<User & { password: string }>>({});
  const [saveLoading, setSaveLoading] = useState(false);

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
      setError("Erreur lors du chargement des utilisateurs");
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

  // Gestionnaire pour les champs TextField
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestionnaire spécifique pour les Select
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save (create/update)
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      // Validation des champs requis
      if (!formData.nom || !formData.email || !formData.telephone || !formData.role) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Pour la création, vérifier le mot de passe
      if (!formData.id && !formData.password) {
        setError("Le mot de passe est requis pour la création");
        return;
      }

      if (formData.id) {
        // Modification - utiliser PUT pour la mise à jour complète
        await axios.put(
          `https://safimayi-backend.onrender.com/api/users/${formData.id}/`,
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        setSuccessMessage("Utilisateur modifié avec succès");
      } else {
        // Création
        await axios.post(
          "https://safimayi-backend.onrender.com/api/users/create-list/",
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        setSuccessMessage("Utilisateur créé avec succès");
      }
      
      fetchUsers();
      setOpenDialog(false);
      setFormData({});
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde :", error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          "Erreur lors de la sauvegarde";
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async () => {
    try {
      if (!selectedUser) return;
      
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://safimayi-backend.onrender.com/api/users/${selectedUser.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccessMessage("Utilisateur désactivé avec succès");
      fetchUsers();
      handleMenuClose();
    } catch (error: any) {
      console.error("Erreur lors de la suppression :", error);
      setError(error.response?.data?.detail || "Erreur lors de la suppression");
    }
  };

  // Activer/Désactiver un utilisateur
  const handleToggleStatus = async () => {
    try {
      if (!selectedUser) return;
      
      const token = localStorage.getItem("token");
      const newState = !selectedUser.state;
      
      await axios.patch(
        `https://safimayi-backend.onrender.com/api/users/${selectedUser.id}/`,
        { state: newState },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccessMessage(`Utilisateur ${newState ? "activé" : "désactivé"} avec succès`);
      fetchUsers();
      handleMenuClose();
    } catch (error: any) {
      console.error("Erreur lors du changement de statut :", error);
      setError(error.response?.data?.detail || "Erreur lors du changement de statut");
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
            setError("");
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
            <InputLabel id="role-filter-label">Rôle</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as string)}
              displayEmpty
              label="Rôle"
              labelId="role-filter-label"
              style={{ minWidth: 120 }}
            >
             
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="agent">Agent</MenuItem>
              <MenuItem value="gerant">Gérant</MenuItem>
              <MenuItem value="owner">Propriétaire</MenuItem>
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
              <CircularProgress />
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
                              Inactif
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
              setError("");
              handleMenuClose();
            }}
          >
            Modifier
          </MenuItem>
          <MenuItem
            onClick={handleToggleStatus}
          >
            {selectedUser?.state ? "Désactiver" : "Activer"}
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            sx={{ color: "error.main" }}
          >
            Supprimer
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Dialog Ajout / Édition */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid sx={{width: '100%'}}>
              <TextField
                label="Nom complet"
                name="nom"
                value={formData.nom || ""}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid sx={{width: '100%'}}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid sx={{width: '100%'}}>
              <TextField
                label="Téléphone"
                name="telephone"
                value={formData.telephone || ""}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            {!formData.id && (
              <Grid sx={{width: '100%'}} >
                <TextField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={handleInputChange}
                  fullWidth
                  required={!formData.id}
                />
              </Grid>
            )}
            <Grid sx={{width: '100%'}} >
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role || "client"}
                  label="Rôle"
                  onChange={(e) => handleSelectChange("role", e.target.value as string)}
                  required
                >
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="agent">Agent Commercial</MenuItem>
                  <MenuItem value="gerant">Gérant</MenuItem>
                  <MenuItem value="owner">Propriétaire</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={saveLoading}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={16} /> : null}
          >
            {saveLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}