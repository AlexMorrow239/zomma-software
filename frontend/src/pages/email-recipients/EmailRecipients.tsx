import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/common/button/Button";
import { FormField } from "@/components/common/form-field/FormField";
import Loader from "@/components/common/loader/Loader";
import { Modal } from "@/components/common/modal/Modal";

import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import {
  type EmailRecipientForm,
  emailRecipientSchema,
} from "@/schemas/emailRecipientSchemas";

import "./EmailRecipients.scss";

// Define types based on the backend schema
interface EmailRecipient {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateEmailRecipientDto {
  email: string;
  name?: string;
  active?: boolean;
}

type UpdateEmailRecipientDto = Partial<CreateEmailRecipientDto>;

export default function EmailRecipients() {
  // State for form management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] =
    useState<EmailRecipient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [error, setError] = useState<string | null>(null);

  // Form setup for edit modal
  const editForm = useForm<EmailRecipientForm>({
    resolver: zodResolver(emailRecipientSchema),
  });

  // Fetch recipients
  const {
    data: recipients,
    isLoading,
    refetch,
  } = useApiQuery<EmailRecipient[]>("/email-recipients", {
    onError: (error: Error) => {
      setError(`Failed to fetch recipients: ${error.message}`);
    },
  });

  // Create recipient mutation
  const createMutation = useApiMutation<
    EmailRecipient,
    CreateEmailRecipientDto
  >("/email-recipients", {
    onSuccess: () => {
      refetch();
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: Error) => {
      setError(`Failed to create recipient: ${error.message}`);
    },
  });

  // Update recipient mutation
  const updateMutation = useApiMutation<
    EmailRecipient,
    UpdateEmailRecipientDto
  >(selectedRecipient ? `/email-recipients/${selectedRecipient.id}` : "", {
    method: "PUT",
    onSuccess: () => {
      refetch();
      setShowEditModal(false);
      setSelectedRecipient(null);
    },
    onError: (error: Error) => {
      setError(`Failed to update recipient: ${error.message}`);
    },
  });

  // Delete recipient mutation
  const deleteMutation = useApiMutation<void, void>(
    selectedRecipient ? `/email-recipients/${selectedRecipient.id}` : "",
    {
      method: "DELETE",
      onSuccess: () => {
        refetch();
        setShowDeleteModal(false);
        setSelectedRecipient(null);
      },
      onError: (error: Error) => {
        setError(`Failed to delete recipient: ${error.message}`);
      },
    }
  );

  // Filter recipients based on search term
  const filteredRecipients = recipients?.filter((recipient) => {
    if (!debouncedSearchTerm) return true;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      recipient.email.toLowerCase().includes(searchLower) ||
      (recipient.name?.toLowerCase() || "").includes(searchLower)
    );
  });

  // Handle create form submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      email: "",
      name: "",
      active: true,
    });
  };

  // Handle update form submission
  const handleUpdateSubmit = editForm.handleSubmit((data) => {
    if (!selectedRecipient) return;
    updateMutation.mutate(data);
  });

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!selectedRecipient) return;
    deleteMutation.mutate();
  };

  // Handle edit button click
  const handleEditClick = (recipient: EmailRecipient) => {
    setSelectedRecipient(recipient);
    editForm.reset({
      email: recipient.email,
      name: recipient.name || "",
      active: recipient.active,
    });
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (recipient: EmailRecipient) => {
    setSelectedRecipient(recipient);
    setShowDeleteModal(true);
  };

  // Handle toggling active status
  const handleToggleActive = (recipient: EmailRecipient) => {
    setSelectedRecipient(recipient);
    updateMutation.mutate({
      active: !recipient.active,
    });
  };

  // Reset form data
  const resetForm = () => {
    editForm.reset({
      email: "",
      name: "",
      active: true,
    });
    setError(null);
  };

  // Open add modal
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Modal components
  const addModalContent = (
    <form onSubmit={handleCreateSubmit}>
      {error && (
        <div className="error-message">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <FormField
        formType="generic"
        label="Email Address"
        name="email"
        type="email"
        required={true}
        placeholder="Enter email address"
      />

      <FormField
        formType="generic"
        label="Name"
        name="name"
        required={false}
        placeholder="Enter name"
      />

      <div className="form-field">
        <label className="form-field__label">Active</label>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            name="active"
            defaultChecked={true}
            className="form-field__checkbox"
          />
        </div>
      </div>
    </form>
  );

  const addModalFooter = (
    <div className="modal-actions">
      <Button variant="ghost" onClick={() => setShowAddModal(false)}>
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={handleCreateSubmit}
        isLoading={createMutation.isPending}
      >
        Save Recipient
      </Button>
    </div>
  );

  const editModalContent = (
    <form id="edit-email-recipient-form" onSubmit={handleUpdateSubmit}>
      {error && (
        <div className="error-message">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <FormField<EmailRecipientForm>
        formType="generic"
        label="Email Address"
        name="email"
        type="email"
        form={editForm}
        required
      />

      <FormField<EmailRecipientForm>
        formType="generic"
        label="Name"
        name="name"
        form={editForm}
      />

      <FormField<EmailRecipientForm>
        formType="generic"
        label="Active"
        name="active"
        type="checkbox"
        form={editForm}
      />
    </form>
  );

  const editModalFooter = (
    <>
      <Button variant="ghost" onClick={() => setShowEditModal(false)}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="edit-email-recipient-form"
        isLoading={updateMutation.isPending}
      >
        Update Recipient
      </Button>
    </>
  );

  const deleteModalContent = (
    <>
      {error && (
        <div className="error-message">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <p>
        Are you sure you want to delete the recipient
        <strong> {selectedRecipient?.email}</strong>?
      </p>
      <p className="text-danger">This action cannot be undone.</p>
    </>
  );

  const deleteModalFooter = (
    <>
      <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      >
        Delete Recipient
      </Button>
    </>
  );

  return (
    <div className="email-recipients-container">
      <div className="page-header">
        <h1>Email Recipients</h1>
        <Button onClick={handleAddClick}>
          <Plus size={16} /> Add Recipient
        </Button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search recipients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-field__input"
        />
      </div>

      {error && (
        <div className="error-message main-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="loader-container">
          <Loader isLoading={true} />
        </div>
      ) : (
        <div className="recipients-table-wrapper">
          <table className="recipients-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipients?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No recipients found
                  </td>
                </tr>
              ) : (
                filteredRecipients?.map((recipient) => (
                  <tr key={recipient.id}>
                    <td>{recipient.email}</td>
                    <td>{recipient.name || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          recipient.active ? "active" : "inactive"
                        }`}
                      >
                        {recipient.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(recipient)}
                        >
                          {recipient.active ? (
                            <>
                              <XCircle size={16} /> Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} /> Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(recipient)}
                        >
                          <Edit size={16} /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(recipient)}
                        >
                          <Trash2 size={16} /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Email Recipient"
        size="sm"
        footer={addModalFooter}
      >
        {addModalContent}
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Email Recipient"
        size="sm"
        footer={editModalFooter}
      >
        {editModalContent}
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Email Recipient"
        size="sm"
        footer={deleteModalFooter}
      >
        {deleteModalContent}
      </Modal>
    </div>
  );
}
