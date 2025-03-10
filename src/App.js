"use client"

import { useState, useEffect } from "react"

function App() {
  const [cases, setCases] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCases, setFilteredCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [formData, setFormData] = useState({
    licensePlate: "",
    description: "",
    status: "Åpen",
    assignedTo: "",
    possibleSolution: "",
  })
  const [newUpdate, setNewUpdate] = useState("")
  const [isAddingCase, setIsAddingCase] = useState(false)

  useEffect(() => {
    const savedCases = localStorage.getItem("cases")
    if (savedCases) {
      setCases(JSON.parse(savedCases))
    } else {
      setCases(initialCases)
      localStorage.setItem("cases", JSON.stringify(initialCases))
    }
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase()
      const filtered = cases.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(lowercaseQuery) ||
          c.licensePlate.toLowerCase().includes(lowercaseQuery) ||
          c.description.toLowerCase().includes(lowercaseQuery) ||
          c.status.toLowerCase().includes(lowercaseQuery),
      )
      setFilteredCases(filtered)
    } else {
      setFilteredCases(cases)
    }
  }, [searchQuery, cases])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (e) => {
    if (!selectedCase) return

    const newStatus = e.target.value

    const updatedCase = {
      ...selectedCase,
      status: newStatus,
    }

    const updatedCases = cases.map((c) => (c.caseNumber === selectedCase.caseNumber ? updatedCase : c))

    localStorage.setItem("cases", JSON.stringify(updatedCases))
    setCases(updatedCases)
    setSelectedCase(updatedCase)
  }

  const handleAddCase = (e) => {
    e.preventDefault()

    const caseNumber = `SAK-${new Date().getTime().toString().slice(-6)}`

    const newCase = {
      caseNumber,
      licensePlate: formData.licensePlate.toUpperCase(),
      description: formData.description,
      status: formData.status,
      dateCreated: new Date().toISOString(),
      assignedTo: formData.assignedTo,
      possibleSolution: formData.possibleSolution,
      updates: [],
    }

    const updatedCases = [newCase, ...cases]
    localStorage.setItem("cases", JSON.stringify(updatedCases))
    setCases(updatedCases)

    setFormData({
      licensePlate: "",
      description: "",
      status: "Åpen",
      assignedTo: "",
      possibleSolution: "",
    })
    setIsAddingCase(false)
    setSelectedCase(newCase)
  }

  const handleAddUpdate = () => {
    if (!newUpdate.trim() || !selectedCase) return

    const update = {
      id: Date.now().toString(),
      text: newUpdate,
      timestamp: new Date().toISOString(),
    }

    const updatedCase = {
      ...selectedCase,
      updates: [update, ...selectedCase.updates],
    }

    const updatedCases = cases.map((c) => (c.caseNumber === selectedCase.caseNumber ? updatedCase : c))

    localStorage.setItem("cases", JSON.stringify(updatedCases))
    setCases(updatedCases)
    setSelectedCase(updatedCase)
    setNewUpdate("")
  }

  const handleDeleteCase = () => {
    if (!selectedCase) return

    if (window.confirm("Er du sikker på at du vil slette denne saken?")) {
      const updatedCases = cases.filter((c) => c.caseNumber !== selectedCase.caseNumber)
      localStorage.setItem("cases", JSON.stringify(updatedCases))
      setCases(updatedCases)
      setSelectedCase(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("no-NO")
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("no-NO")
  }

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "åpen":
        return "status-open"
      case "pågår":
        return "status-in-progress"
      case "fullført":
        return "status-completed"
      default:
        return "status-default"
    }
  }

  const renderSearchBar = () => (
    <div className="search-container">
      <input
        type="text"
        placeholder="Søk etter saksnummer, registreringsnummer eller beskrivelse..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      {searchQuery && (
        <button className="clear-search-button" onClick={() => setSearchQuery("")}>
          ✕
        </button>
      )}
      <button className="search-button">🔍</button>
    </div>
  )

  const renderCaseList = () => (
    <div className="case-list">
      <div className="case-list-header">
        <h2>Alle saker</h2>
        <button className="add-button" onClick={() => setIsAddingCase(true)}>
          + Ny sak
        </button>
      </div>

      {filteredCases.length === 0 ? (
        <div className="no-cases">
          <p>Ingen saker funnet</p>
        </div>
      ) : (
        <div className="case-grid">
          {filteredCases.map((c) => (
            <div key={c.caseNumber} className="case-card" onClick={() => setSelectedCase(c)}>
              <div className="case-card-header">
                <h3>{c.caseNumber}</h3>
                <span className={`status-badge ${getStatusClass(c.status)}`}>{c.status}</span>
              </div>
              <div className="case-card-content">
                <p className="license-plate">Reg.nr: {c.licensePlate}</p>
                <p className="description">{c.description}</p>
              </div>
              <div className="case-card-footer">Registrert: {formatDate(c.dateCreated)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderNewCaseForm = () => (
    <div className="case-form-container">
      <button className="back-button" onClick={() => setIsAddingCase(false)}>
        ← Tilbake til oversikten
      </button>

      <div className="case-form-card">
        <h2>Registrer ny sak</h2>
        <form onSubmit={handleAddCase} className="case-form">
          <div className="form-group">
            <label htmlFor="licensePlate">Registreringsnummer</label>
            <input
              id="licensePlate"
              name="licensePlate"
              placeholder="F.eks. AB12345"
              value={formData.licensePlate}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Beskrivelse av feil</label>
            <textarea
              id="description"
              name="description"
              placeholder="Beskriv problemet med bilen..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="form-textarea"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleSelectChange}
              className="form-select"
            >
              <option value="Åpen">Åpen</option>
              <option value="Pågår">Pågår</option>
              <option value="Fullført">Fullført</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Tildelt mekaniker</label>
            <input
              id="assignedTo"
              name="assignedTo"
              placeholder="Navn på mekaniker"
              value={formData.assignedTo}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="possibleSolution">Mulig løsning</label>
            <textarea
              id="possibleSolution"
              name="possibleSolution"
              placeholder="Forslag til løsning..."
              value={formData.possibleSolution}
              onChange={handleChange}
              rows={3}
              className="form-textarea"
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => setIsAddingCase(false)}>
              Avbryt
            </button>
            <button type="submit" className="submit-button">
              Lagre sak
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderCaseDetail = () => (
    <div className="case-detail-container">
      <button className="back-button" onClick={() => setSelectedCase(null)}>
        ← Tilbake til oversikten
      </button>

      <div className="case-detail-grid">
        <div className="case-detail-main">
          <div className="case-detail-card">
            <div className="case-detail-header">
              <h2>{selectedCase.caseNumber}</h2>
              <span className={`status-badge ${getStatusClass(selectedCase.status)}`}>{selectedCase.status}</span>
            </div>
            <div className="case-detail-content">
              <div className="detail-section">
                <h3>Registreringsnummer</h3>
                <p>{selectedCase.licensePlate}</p>
              </div>

              <div className="detail-section">
                <h3>Beskrivelse</h3>
                <p>{selectedCase.description}</p>
              </div>

              {selectedCase.possibleSolution && (
                <div className="detail-section">
                  <h3>Mulig løsning</h3>
                  <p>{selectedCase.possibleSolution}</p>
                </div>
              )}

              <div className="detail-meta">
                <p className="detail-date">Registrert: {formatDate(selectedCase.dateCreated)}</p>

                {selectedCase.assignedTo && <p className="detail-assigned">Tildelt: {selectedCase.assignedTo}</p>}
              </div>
            </div>
          </div>

          <div className="case-detail-card">
            <h3>Oppdateringer</h3>
            <div className="update-form">
              <textarea
                placeholder="Legg til en oppdatering..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                className="update-textarea"
              ></textarea>
              <button onClick={handleAddUpdate} className="update-button">
                Legg til
              </button>
            </div>

            {selectedCase.updates.length === 0 ? (
              <p className="no-updates">Ingen oppdateringer ennå</p>
            ) : (
              <div className="updates-list">
                {selectedCase.updates.map((update) => (
                  <div key={update.id} className="update-item">
                    <p>{update.text}</p>
                    <p className="update-timestamp">{formatDateTime(update.timestamp)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="case-detail-sidebar">
          <div className="case-detail-card">
            <h3>Administrer sak</h3>
            <div className="admin-section">
              <label htmlFor="changeStatus">Endre status</label>
              <select
                id="changeStatus"
                name="status"
                value={selectedCase.status}
                onChange={handleStatusChange}
                className="form-select"
              >
                <option value="Åpen">Åpen</option>
                <option value="Pågår">Pågår</option>
                <option value="Fullført">Fullført</option>
              </select>
            </div>

            <div className="admin-section">
              <button className="delete-button" onClick={handleDeleteCase}>
                Slett sak
              </button>
            </div>
          </div>

          <div className="case-detail-card">
            <h3>Tips</h3>
            <ul className="tips-list">
              <li>Sjekk alltid registreringsnummeret mot bilens vognkort</li>
              <li>Oppdater status jevnlig for å holde kunder informert</li>
              <li>Legg til detaljerte oppdateringer for å dokumentere arbeidet</li>
              <li>Bruk søkefunksjonen for å finne lignende saker</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Åpen sak - Bilverksted</h1>
      </header>

      <main className="app-main">
        {isAddingCase ? (
          renderNewCaseForm()
        ) : selectedCase ? (
          renderCaseDetail()
        ) : (
          <>
            {renderSearchBar()}
            {renderCaseList()}
          </>
        )}
      </main>
    </div>
  )
}

const initialCases = [
  {
    caseNumber: "SAK-123456",
    licensePlate: "AB12345",
    description: "Bilen starter ikke. Kunden rapporterer at det kommer klikkelyder når han vrir om nøkkelen.",
    status: "Åpen",
    dateCreated: "2023-05-15T08:30:00Z",
    assignedTo: "Ole Hansen",
    possibleSolution: "Sjekk batteritilkobling og spenning. Mulig startmotor defekt.",
    updates: [
      {
        id: "1",
        text: "Batteriet målt til 10.5V. Lader nå batteriet for å se om det løser problemet.",
        timestamp: "2023-05-15T10:15:00Z",
      },
    ],
  },
  {
    caseNumber: "SAK-123457",
    licensePlate: "CD67890",
    description: "Oljelampe lyser på dashbordet. Kunden har kjørt ca. 500 km siden sist service.",
    status: "Pågår",
    dateCreated: "2023-05-14T13:45:00Z",
    assignedTo: "Kari Olsen",
    possibleSolution: "Sjekk oljenivå og kvalitet. Mulig lekkasje fra oljepanne.",
    updates: [
      {
        id: "1",
        text: "Oljenivå er lavt. Fant spor av olje under bilen som tyder på lekkasje.",
        timestamp: "2023-05-14T15:30:00Z",
      },
      {
        id: "2",
        text: "Identifisert lekkasje fra oljepannepakning. Bestilt deler.",
        timestamp: "2023-05-15T09:00:00Z",
      },
    ],
  },
  {
    caseNumber: "SAK-123458",
    licensePlate: "EF12345",
    description: "Bremser lager høy pipelyd ved lett bremsing. Kunden sier det startet for ca. 1 uke siden.",
    status: "Fullført",
    dateCreated: "2023-05-10T09:15:00Z",
    assignedTo: "Per Johansen",
    possibleSolution: "Sjekk bremseklosser for slitasje. Mulig fremmedlegeme mellom klosser og skive.",
    updates: [
      {
        id: "1",
        text: "Bremseklosser foran er nesten helt nedslitt. Anbefaler utskifting.",
        timestamp: "2023-05-10T11:00:00Z",
      },
      {
        id: "2",
        text: "Byttet bremseklosser foran og bak. Testkjørt uten problemer.",
        timestamp: "2023-05-11T14:30:00Z",
      },
      {
        id: "3",
        text: "Kunde hentet bil og bekreftet at problemet er løst.",
        timestamp: "2023-05-12T16:00:00Z",
      },
    ],
  },
  {
    caseNumber: "SAK-123459",
    licensePlate: "GH67890",
    description: "AC fungerer ikke. Blåser kun varm luft selv når satt til laveste temperatur.",
    status: "Åpen",
    dateCreated: "2023-05-16T10:00:00Z",
    assignedTo: "",
    possibleSolution: "Sjekk kjølemiddelnivå. Mulig lekkasje i AC-system eller defekt kompressor.",
    updates: [],
  },
  {
    caseNumber: "SAK-123460",
    licensePlate: "IJ12345",
    description: "Servostyring føles tung. Kunden rapporterer at det gradvis har blitt verre de siste ukene.",
    status: "Pågår",
    dateCreated: "2023-05-15T14:30:00Z",
    assignedTo: "Lisa Andersen",
    possibleSolution: "Sjekk servovæskenivå og tilstand. Mulig lekkasje eller slitt servopumpe.",
    updates: [
      {
        id: "1",
        text: "Servovæskenivå er lavt. Etterfylt og sjekker for lekkasjer.",
        timestamp: "2023-05-15T16:00:00Z",
      },
    ],
  },
]

export default App
