import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tabs, Tab,
  Pagination, FormControl, InputLabel, Autocomplete, Chip
} from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
import DeleteIcon from "@mui/icons-material/Delete";

interface RFID {
  id: number;
  code: string;
  code_uid: string;
  telephone: string;
  active: boolean;
  created_at: string;
  prix: number;
  solde_litres?: number;
  user_nom?: string;
  user_email?: string;
  user_id?: number;
}

interface User {
  id: number;
  nom: string;
  email: string;
  telephone: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  current_page: number;
  total_pages: number;
}

export function RFIDView() {
  const [rfids, setRfids] = useState<RFID[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // NOUVEAU ÉTAT
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    page_size: 8,
    current_page: 1,
    total_pages: 1
  });

  // Filtres
  const [searchCode, setSearchCode] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [statutFilter, setStatutFilter] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(8);

  // Recherche utilisateur
  const [searchUser, setSearchUser] = useState<string>("");

  // Menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRfid, setSelectedRfid] = useState<RFID | null>(null);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState<"single" | "multiple" | "auto">("single");
  const [formData, setFormData] = useState<any>({});

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, rfid: RFID) => {
    setAnchorEl(event.currentTarget);
    setSelectedRfid(rfid);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Charger les utilisateurs avec debounce - SIMPLIFIÉ
  const searchUsers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setUsers([]);
      return;
    }

    try {
      setLoadingUsers(true);
      const response = await apiClient.get(
        `/api/users/search/?search=${encodeURIComponent(searchTerm)}&page_size=10`
      );
      setUsers(response.data.results || []);
    } catch (err) {
      console.error("Erreur lors de la recherche d'utilisateurs:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Debounce pour la recherche d'utilisateurs
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchUser);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchUser]);

  // Charger les cartes avec pagination et filtres
  const fetchRfids = async (page: number = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (searchCode) params.append('search', searchCode);
      if (statusFilter) params.append('active', statusFilter);
      if (statutFilter) params.append('statut', statutFilter);

      const response = await apiClient.get(`/api/rfid/list-rfid-pagination?${params}`);
      const data = response.data;
      
      setRfids(data.results || []);
      setPagination({
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
        page_size: data.page_size || 20,
        current_page: data.current_page || 1,
        total_pages: data.total_pages || 1
      });
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchRfids(1);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRfids(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchCode, statusFilter, statutFilter, pageSize]);

  // Changement de page
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    fetchRfids(value);
  };

  // Changement de la taille de page
  const handlePageSizeChange = (event: any) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
  };

  // Save
  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (mode === "single") {
        if (formData.id) {
          const updateData: any = {};
          if (formData.telephone !== undefined) updateData.telephone = formData.telephone;
          if (formData.code_uid !== undefined) updateData.code_uid = formData.code_uid;
          if (formData.code !== undefined) updateData.code = formData.code;
          
          if (formData.user_id !== undefined) {
            updateData.user_id = formData.user_id;
          }

          await apiClient.put(
            `/api/rfid/update/${formData.id}/`,
            updateData
          );
        } else {
          await apiClient.post(
            `/api/rfid/`,
            {
              code_uid: formData.code_uid,
              telephone: formData.telephone,
            }
          );
        }
      }

      if (mode === "multiple") {
        await apiClient.post(
          `/api/rfid/`,
          formData.list || []
        );
      }

      if (mode === "auto") {
        await apiClient.post(
          `/api/rfid/`,
          {
            nombre: formData.nombre,
          }
        );
      }

      fetchRfids(pagination.current_page);
      setOpenDialog(false);
      setFormData({});
      setSearchUser("");
      setUsers([]);
      setCurrentUser(null);
    } catch (error) {
      console.error("Erreur sauvegarde :", error);
      alert("Erreur lors de la sauvegarde de la carte RFID");
    } finally {
      setSaving(false);
    }
  };

  // Toggle activation
  const handleToggleActivation = async (code_uid: string) => {
    try {
      setToggling(code_uid);
      await apiClient.post(
        `/api/rfid/toggle/`,
        { uid: code_uid }
      );
      fetchRfids(pagination.current_page);
    } catch (error) {
      console.error("Erreur lors de l'activation/désactivation :", error);
      alert("Erreur lors de la modification du statut de la carte");
    } finally {
      setToggling(null);
    }
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchCode("");
    setStatusFilter("");
    setStatutFilter("");
    setPageSize(8);
  };

  // Trouver l'utilisateur sélectionné pour l'affichage - CORRIGÉ
  const getSelectedUser = () => {
    if (!formData.user_id) return null;
    
    // Chercher d'abord dans currentUser, puis dans users
    if (currentUser && currentUser.id === formData.user_id) {
      return currentUser;
    }
    return users.find(user => user.id === formData.user_id) || null;
  };

  // Charger l'utilisateur actuel quand le dialog s'ouvre - CORRIGÉ
  useEffect(() => {
    if (openDialog && formData.id && formData.user_id && !currentUser) {
      const fetchCurrentUser = async () => {
        try {
          const response = await apiClient.get(`/api/users/${formData.user_id}/`);
          const user = response.data;
          setCurrentUser(user); // Stocker l'utilisateur actuel séparément
        } catch (error) {
          console.error("Erreur lors du chargement de l'utilisateur actuel:", error);
        }
      };
      
      fetchCurrentUser();
    }
  }, [openDialog, formData.id, formData.user_id, currentUser]);

  // Fonction pour ouvrir le dialog de configuration en cliquant sur la carte - CORRIGÉ
  const handleCardClick = (rfid: RFID) => {
    setFormData(rfid);
    setOpenDialog(true);
    setMode("single");
    setSearchUser("");
    setUsers([]);
    setCurrentUser(null); // Reset de l'utilisateur actuel
  };

  return (
    <DashboardContent>
      {/* Titre et bouton d'ajout */}
      <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Cartes RFID ({pagination.count})
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => {
            setFormData({});
            setMode("single");
            setOpenDialog(true);
            setSearchUser("");
            setUsers([]);
            setCurrentUser(null);
          }}
        >
          Ajouter une carte RFID
        </Button>
      </Box>

      {/* Filtres */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="Rechercher (UID, Code, Téléphone)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            size="small"
            placeholder="UID, code ou téléphone..."
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Statut actif</InputLabel>
            <Select
              value={statusFilter}
              label="Statut actif"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="true">Actifs</MenuItem>
              <MenuItem value="false">Désactivés</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statutFilter}
              label="Statut"
              onChange={(e) => setStatutFilter(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="stock">En stock</MenuItem>
              <MenuItem value="vendu">Vendu</MenuItem>
              <MenuItem value="actif">Actif</MenuItem>
              <MenuItem value="bloque">Bloqué</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Par page</InputLabel>
            <Select
              value={pageSize}
              label="Par page"
              onChange={handlePageSizeChange}
            >
              <MenuItem value={8}>8</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={40}>40</MenuItem>
              <MenuItem value={60}>60</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={handleResetFilters}
          >
            Réinitialiser
          </Button>
        </Box>
      </Card>

      {/* Pagination en haut */}
      {pagination.total_pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {pagination.current_page} sur {pagination.total_pages} 
            ({pagination.count} cartes au total)
          </Typography>
          <Pagination 
            count={pagination.total_pages} 
            page={pagination.current_page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Cards avec affichage du code et du solde de litrage */}
      <Grid container spacing={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : rfids.length > 0 ? (
          rfids.map((rfid) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={rfid.id}>
              <Card 
                sx={{ 
                  p: 2, 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 1.5, 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleCardClick(rfid)}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {rfid.code_uid}
                  </Typography>
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, rfid);
                    }} 
                    size="small"
                    disabled={toggling === rfid.code_uid}
                  >
                    {toggling === rfid.code_uid ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Iconify icon="eva:more-vertical-fill" />
                    )}
                  </IconButton>
                </Box>
                
                {/* Affichage du code à 6 chiffres */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: '#0486d9',
                  color: 'white'
                }}>
                  <Typography variant="body2" fontWeight="bold">
                    Code:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {rfid.code || "N/A"}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Tél: {rfid.telephone || "Non attribué"}
                </Typography>

                {/* Affichage de l'utilisateur associé */}
                {rfid.user_nom && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Utilisateur:
                    </Typography>
                    <Chip 
                      label={rfid.user_nom} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                )}
                
                {/* Affichage du solde de litrage */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: (rfid.solde_litres || 0) > 0 ? 'success.light' : 'grey.50'
                }}>
                  <Typography variant="body2" fontWeight="medium">
                    Solde litres:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: (rfid.solde_litres || 0) > 0 ? 'success.dark' : 'text.secondary'
                    }}
                  >
                    {rfid.solde_litres || 0} L
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(rfid.created_at).toLocaleDateString()}
                  </Typography>
                  
                  <Box>
                    {rfid.active ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Actif
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                        Désactivé
                      </span>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Box sx={{ width: '100%', textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Aucune carte RFID trouvée
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Essayez de modifier vos critères de recherche
            </Typography>
          </Box>
        )}
      </Grid>

      {/* Pagination en bas */}
      {pagination.total_pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={pagination.total_pages} 
            page={pagination.current_page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuList>
          <MenuItemMui
            onClick={() => {
              setFormData(selectedRfid || {});
              setOpenDialog(true);
              handleMenuClose();
              setMode("single");
              setSearchUser("");
              setUsers([]);
              setCurrentUser(null);
            }}
          >
            Configurer
          </MenuItemMui>
          <MenuItemMui
            onClick={() => {
              if (selectedRfid) handleToggleActivation(selectedRfid.code_uid);
              handleMenuClose();
            }}
            disabled={toggling === selectedRfid?.code_uid}
          >
            {toggling === selectedRfid?.code_uid ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <span>Chargement...</span>
              </Box>
            ) : (
              selectedRfid?.active ? "Désactiver" : "Activer"
            )}
          </MenuItemMui>
        </MenuList>
      </Menu>

      {/* Dialog Ajout / Édition */}
      <Dialog open={openDialog} onClose={() => {
        if (!saving) {
          setOpenDialog(false);
          setFormData({});
          setSearchUser("");
          setUsers([]);
          setCurrentUser(null);
        }
      }} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Éditer la carte RFID" : "Nouvelle carte RFID"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Tabs value={mode} onChange={(e, v) => setMode(v)}>
            <Tab label="Simple" value="single" />
            {!formData.id && <Tab label="Multiple" value="multiple" />}
            {!formData.id && <Tab label="Auto" value="auto" />}
          </Tabs>

          {mode === "single" && (
            <>
              <TextField
                label="Code UID"
                value={formData.code_uid || ""}
                onChange={(e) => setFormData({ ...formData, code_uid: e.target.value })}
                fullWidth
                disabled={saving}
              />
              {formData.id && (
                <TextField
                  label="Code (6 chiffres)"
                  value={formData.code || ""}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  fullWidth
                  inputProps={{ maxLength: 6 }}
                  helperText="Code à 6 chiffres unique"
                  disabled={saving}
                />
              )}
              <TextField
                label="Téléphone"
                value={formData.telephone || ""}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                fullWidth
                disabled={saving}
              />
              
              {/* Sélection de l'utilisateur avec recherche en temps réel */}
              {formData.id && (
                <FormControl fullWidth>
                  <Autocomplete
                    options={users}
                    getOptionLabel={(option) => `${option.nom} - ${option.telephone || option.email}`}
                    value={getSelectedUser()}
                    onChange={(event, newValue) => {
                      setFormData({ 
                        ...formData, 
                        user_id: newValue ? newValue.id : null 
                      });
                    }}
                    onInputChange={(event, newValue) => {
                      setSearchUser(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Associer à un utilisateur"
                        placeholder="Tapez au moins 2 caractères pour rechercher..."
                        helperText="Recherchez un utilisateur par nom, email ou téléphone. Laissez vide ou cliquez sur 'Retirer' pour que la carte n'ait pas de propriétaire."
                        disabled={saving}
                      />
                    )}
                    loading={loadingUsers}
                    noOptionsText={searchUser.length < 2 ? "Tapez au moins 2 caractères" : "Aucun utilisateur trouvé"}
                    disabled={saving}
                  />
                  
                  {/* Affichage de l'utilisateur actuel */}
                  {formData.user_id && getSelectedUser() && (
                    <Box sx={{ mt: 1, p: 1, backgroundColor: 'info.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="info.dark">
                        Utilisateur actuel: {getSelectedUser()?.nom} ({getSelectedUser()?.telephone || getSelectedUser()?.email})
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Option pour retirer complètement l'utilisateur */}
                  {formData.user_id && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => {
                        setFormData({ 
                          ...formData, 
                          user_id: null 
                        });
                        setSearchUser("");
                      }}
                      disabled={saving}
                      startIcon={<DeleteIcon />}
                      sx={{ mt: 1 }}
                    >
                      Retirer l'utilisateur (devenir sans propriétaire)
                    </Button>
                  )}

                  {/* Indication quand aucun utilisateur n'est associé */}
                  {!formData.user_id && formData.id && (
                    <Box sx={{ mt: 1, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucun utilisateur associé - La carte n'appartient à personne
                      </Typography>
                    </Box>
                  )}
                </FormControl>
              )}
            </>
          )}
       
          {!formData.id && (
            <>
              {mode === "multiple" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {(formData.list || []).map((item: any, index: number) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", gap: 2, alignItems: "center" }}
                    >
                      <TextField
                        label="Code UID"
                        value={item.code_uid || ""}
                        onChange={(e) => {
                          const newList = [...(formData.list || [])];
                          newList[index] = { ...newList[index], code_uid: e.target.value };
                          setFormData({ ...formData, list: newList });
                        }}
                        fullWidth
                        disabled={saving}
                      />
                      <TextField
                        label="Téléphone"
                        value={item.telephone || ""}
                        onChange={(e) => {
                          const newList = [...(formData.list || [])];
                          newList[index] = { ...newList[index], telephone: e.target.value };
                          setFormData({ ...formData, list: newList });
                        }}
                        fullWidth
                        disabled={saving}
                      />
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newList = [...(formData.list || [])];
                          newList.splice(index, 1);
                          setFormData({ ...formData, list: newList });
                        }}
                        disabled={saving}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Box>
                  ))}

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        list: [...(formData.list || []), { code_uid: "", telephone: "" }],
                      })
                    }
                    disabled={saving}
                  >
                    + Ajouter une carte
                  </Button>
                </Box>
              )}

              {mode === "auto" && (
                <TextField
                  label="Nombre de cartes"
                  type="number"
                  value={formData.nombre || 1}
                  onChange={(e) => setFormData({ ...formData, nombre: Number(e.target.value) })}
                  fullWidth
                  disabled={saving}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setFormData({});
              setSearchUser("");
              setUsers([]);
              setCurrentUser(null);
            }}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}