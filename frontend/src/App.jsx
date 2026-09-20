import { useEffect, useState } from 'react'
import api from './api'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('dashboard')

  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])

  const [commissionData, setCommissionData] = useState({
    summary: {
      total_sales: 0,
      total_sales_amount: 0,
      total_commission: 0,
      total_quantity: 0,
    },
    by_salesperson: [],
  })

  const [reportsData, setReportsData] = useState({
    summary: {
      total_sales: 0,
      total_revenue: 0,
      total_commission: 0,
      total_quantity: 0,
    },
    top_products: [],
    top_customers: [],
    by_salesperson: [],
  })

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
  })

  const [saleForm, setSaleForm] = useState({
    customer: '',
    product: '',
    quantity: 1,
  })

  const [editingSaleId, setEditingSaleId] = useState(null)

  const [dateFilters, setDateFilters] = useState({
    start_date: '',
    end_date: '',
  })

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  })

  const [loginError, setLoginError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, dateFilters])

  async function checkAuth() {
    try {
      const response = await api.get('auth/me/')
      setUser(response.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadData() {
    const params = {}

    if (dateFilters.start_date) {
      params.start_date = dateFilters.start_date
    }

    if (dateFilters.end_date) {
      params.end_date = dateFilters.end_date
    }

    try {
      const [
        customersResponse,
        productsResponse,
        salesResponse,
        commissionResponse,
        reportsResponse,
      ] = await Promise.all([
        api.get('customers/'),
        api.get('products/'),
        api.get('sales/', { params }),
        api.get('commission/', { params }),
        api.get('reports/', { params }),
      ])

      setCustomers(customersResponse.data)
      setProducts(productsResponse.data)
      setSales(salesResponse.data)
      setCommissionData(commissionResponse.data)
      setReportsData(reportsResponse.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()

    setLoginError('')

    try {
      const response = await api.post(
        'auth/login/',
        loginForm
      )

      setUser(response.data)

      setLoginForm({
        username: '',
        password: '',
      })
    } catch (error) {
      setLoginError(
        error.response?.data?.detail ||
          'Invalid username or password.'
      )
    }
  }

  async function handleLogout() {
    try {
      await api.post('auth/logout/')
    } catch (error) {
      console.error('Logout error:', error)
    }

    setUser(null)
    setCustomers([])
    setProducts([])
    setSales([])

    setCommissionData({
      summary: {
        total_sales: 0,
        total_sales_amount: 0,
        total_commission: 0,
        total_quantity: 0,
      },
      by_salesperson: [],
    })

    setReportsData({
      summary: {
        total_sales: 0,
        total_revenue: 0,
        total_commission: 0,
        total_quantity: 0,
      },
      top_products: [],
      top_customers: [],
      by_salesperson: [],
    })

    setActivePage('dashboard')
  }

  async function handleCustomerSubmit(event) {
    event.preventDefault()

    setSaving(true)

    try {
      await api.post('customers/', customerForm)

      setCustomerForm({
        name: '',
        email: '',
        phone: '',
        address: '',
      })

      await loadData()
    } catch (error) {
      console.error('Failed to create customer:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault()

    setSaving(true)

    try {
      await api.post('products/', {
        name: productForm.name,
        price: Number(productForm.price),
      })

      setProductForm({
        name: '',
        price: '',
      })

      await loadData()
    } catch (error) {
      console.error('Failed to create product:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaleSubmit(event) {
    event.preventDefault()

    setSaving(true)

    try {
      const saleData = {
        customer: Number(saleForm.customer),
        product: Number(saleForm.product),
        quantity: Number(saleForm.quantity),
      }

      if (editingSaleId) {
        await api.patch(
          `sales/${editingSaleId}/`,
          saleData
        )
      } else {
        await api.post('sales/', saleData)
      }

      resetSaleForm()
      await loadData()
    } catch (error) {
      console.error('Failed to save sale:', error)
    } finally {
      setSaving(false)
    }
  }

  function editSale(sale) {
    setEditingSaleId(sale.id)

    setSaleForm({
      customer: String(sale.customer),
      product: String(sale.product),
      quantity: sale.quantity,
    })

    setActivePage('sales')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function deleteSale(saleId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this sale?'
    )

    if (!confirmed) {
      return
    }

    try {
      await api.delete(`sales/${saleId}/`)
      await loadData()
    } catch (error) {
      console.error('Failed to delete sale:', error)
      alert('Failed to delete sale.')
    }
  }

  function resetSaleForm() {
    setSaleForm({
      customer: '',
      product: '',
      quantity: 1,
    })

    setEditingSaleId(null)
  }

  function formatCurrency(value) {
    return `₹${Number(value || 0).toFixed(2)}`
  }

  function clearDateFilters() {
    setDateFilters({
      start_date: '',
      end_date: '',
    })
  }

  function renderDashboard() {
    const totalSales = sales.length

    const totalRevenue = sales.reduce(
      (sum, sale) =>
        sum + Number(sale.total_amount || 0),
      0
    )

    const totalCommission = sales.reduce(
      (sum, sale) =>
        sum + Number(sale.commission || 0),
      0
    )

    const totalQuantity = sales.reduce(
      (sum, sale) =>
        sum + Number(sale.quantity || 0),
      0
    )

    return (
      <>
        <div className="cards">
          <div className="card">
            <p>Total Customers</p>
            <h2>{customers.length}</h2>
          </div>

          <div className="card">
            <p>Total Products</p>
            <h2>{products.length}</h2>
          </div>

          <div className="card">
            <p>Total Sales</p>
            <h2>{totalSales}</h2>
          </div>

          <div className="card">
            <p>Total Revenue</p>
            <h2>{formatCurrency(totalRevenue)}</h2>
          </div>

          <div className="card">
            <p>Total Commission</p>
            <h2>{formatCurrency(totalCommission)}</h2>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Sales Summary</h2>
          </div>

          <div className="cards">
            <div className="card">
              <p>Total Quantity</p>
              <h2>{totalQuantity}</h2>
            </div>

            <div className="card">
              <p>Average Sale</p>
              <h2>
                {formatCurrency(
                  totalSales
                    ? totalRevenue / totalSales
                    : 0
                )}
              </h2>
            </div>

            <div className="card">
              <p>Highest Sale</p>
              <h2>
                {formatCurrency(
                  sales.length
                    ? Math.max(
                        ...sales.map((sale) =>
                          Number(
                            sale.total_amount || 0
                          )
                        )
                      )
                    : 0
                )}
              </h2>
            </div>

            <div className="card">
              <p>Commission Rate</p>
              <h2>
                {totalRevenue
                  ? (
                      (totalCommission /
                        totalRevenue) *
                      100
                    ).toFixed(1)
                  : '0.0'}
                %
              </h2>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Recent Sales</h2>
          </div>

          {sales.length === 0 ? (
            <div className="empty-state">
              <h3>No sales found</h3>
              <p>
                Sales will appear here once they are
                created.
              </p>
            </div>
          ) : (
            <div className="sales-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Commission</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.customer_name}</td>
                      <td>{sale.product_name}</td>
                      <td>{sale.quantity}</td>
                      <td>
                        {formatCurrency(
                          sale.total_amount
                        )}
                      </td>
                      <td>
                        {formatCurrency(
                          sale.commission
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )
  }

  function renderCustomers() {
    return (
      <>
        {user?.is_superuser && (
          <div className="content-section">
            <div className="section-header">
              <h2>Add Customer</h2>
            </div>

            <form
              className="customer-form"
              onSubmit={handleCustomerSubmit}
            >
              <div className="form-group">
                <label>Name</label>

                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(event) =>
                    setCustomerForm({
                      ...customerForm,
                      name: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(event) =>
                    setCustomerForm({
                      ...customerForm,
                      email: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>

                <input
                  type="text"
                  value={customerForm.phone}
                  onChange={(event) =>
                    setCustomerForm({
                      ...customerForm,
                      phone: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>

                <textarea
                  rows="3"
                  value={customerForm.address}
                  onChange={(event) =>
                    setCustomerForm({
                      ...customerForm,
                      address: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="content-section">
          <div className="section-header">
            <h2>Customers</h2>

            <span>{customers.length} customers</span>
          </div>

          {customers.length === 0 ? (
            <div className="empty-state">
              <h3>No customers found</h3>
            </div>
          ) : (
            <div className="sales-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )
  }

  function renderProducts() {
    return (
      <>
        {user?.is_superuser && (
          <div className="content-section">
            <div className="section-header">
              <h2>Add Product</h2>
            </div>

            <form
              className="product-form"
              onSubmit={handleProductSubmit}
            >
              <div className="form-group">
                <label>Product Name</label>

                <input
                  type="text"
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      name: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Price</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      price: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="content-section">
          <div className="section-header">
            <h2>Products</h2>

            <span>{products.length} products</span>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
            </div>
          ) : (
            <div className="sales-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>
                        {formatCurrency(product.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )
  }

  function renderSales() {
    return (
      <>
        <div className="content-section">
          <div className="section-header">
            <h2>
              {editingSaleId
                ? 'Edit Sale'
                : 'Create Sale'}
            </h2>

            {editingSaleId && (
              <button
                type="button"
                onClick={resetSaleForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            className="sale-form"
            onSubmit={handleSaleSubmit}
          >
            <div className="form-group">
              <label>Customer</label>

              <select
                value={saleForm.customer}
                onChange={(event) =>
                  setSaleForm({
                    ...saleForm,
                    customer: event.target.value,
                  })
                }
                required
              >
                <option value="">
                  Select customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Product</label>

              <select
                value={saleForm.product}
                onChange={(event) =>
                  setSaleForm({
                    ...saleForm,
                    product: event.target.value,
                  })
                }
                required
              >
                <option value="">
                  Select product
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} —{' '}
                    {formatCurrency(product.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>

              <input
                type="number"
                min="1"
                value={saleForm.quantity}
                onChange={(event) =>
                  setSaleForm({
                    ...saleForm,
                    quantity: event.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingSaleId
                    ? 'Update Sale'
                    : 'Create Sale'}
              </button>
            </div>
          </form>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Sales</h2>

            <span>{sales.length} sales</span>
          </div>

          {sales.length === 0 ? (
            <div className="empty-state">
              <h3>No sales found</h3>
            </div>
          ) : (
            <div className="sales-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Salesperson</th>
                    <th>Quantity</th>
                    <th>Total Amount</th>
                    <th>Commission</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.customer_name}</td>

                      <td>{sale.product_name}</td>

                      <td>
                        {sale.salesperson_name ||
                          'Not assigned'}
                      </td>

                      <td>{sale.quantity}</td>

                      <td>
                        {formatCurrency(
                          sale.total_amount
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          sale.commission
                        )}
                      </td>

                      <td>
                        {new Date(
                          sale.sale_date
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              editSale(sale)
                            }
                            style={{
                              border:
                                '1px solid #2563eb',
                              background: 'white',
                              color: '#2563eb',
                              padding: '7px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteSale(sale.id)
                            }
                            style={{
                              border:
                                '1px solid #dc2626',
                              background: 'white',
                              color: '#dc2626',
                              padding: '7px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )
  }

  function renderCommission() {
    const summary = commissionData.summary

    const totalAmount = Number(
      summary.total_sales_amount || 0
    )

    const totalCommissionAmount = Number(
      summary.total_commission || 0
    )

    const rate = totalAmount
      ? (totalCommissionAmount / totalAmount) * 100
      : 0

    return (
      <>
        <div className="content-section">
          <div className="section-header">
            <h2>Commission</h2>

            <span>
              {rate.toFixed(1)}% commission rate
            </span>
          </div>

          <div className="cards">
            <div className="card">
              <p>Total Sales</p>
              <h2>{summary.total_sales}</h2>
            </div>

            <div className="card">
              <p>Total Sales Amount</p>
              <h2>
                {formatCurrency(totalAmount)}
              </h2>
            </div>

            <div className="card">
              <p>Total Commission</p>
              <h2>
                {formatCurrency(
                  totalCommissionAmount
                )}
              </h2>
            </div>

            <div className="card">
              <p>Total Quantity</p>
              <h2>{summary.total_quantity}</h2>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Commission by Salesperson</h2>
          </div>

          {commissionData.by_salesperson.length ===
          0 ? (
            <div className="empty-state">
              <h3>No commission data found</h3>
            </div>
          ) : (
            <div className="sales-table">
              <table>
                <thead>
                  <tr>
                    <th>Salesperson</th>
                    <th>Sales Count</th>
                    <th>Quantity</th>
                    <th>Sales Amount</th>
                    <th>Commission</th>
                  </tr>
                </thead>

                <tbody>
                  {commissionData.by_salesperson.map(
                    (person) => (
                      <tr
                        key={
                          person.id ??
                          person.username
                        }
                      >
                        <td>{person.username}</td>

                        <td>
                          {person.sales_count}
                        </td>

                        <td>{person.quantity}</td>

                        <td>
                          {formatCurrency(
                            person.sales_amount
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            person.commission
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )
  }

  function renderReports() {
    const summary = reportsData.summary

    return (
      <>
        <div className="content-section">
          <div className="section-header">
            <h2>Reports</h2>

            <div>
              <input
                type="date"
                value={dateFilters.start_date}
                onChange={(event) =>
                  setDateFilters({
                    ...dateFilters,
                    start_date: event.target.value,
                  })
                }
              />

              <input
                type="date"
                value={dateFilters.end_date}
                onChange={(event) =>
                  setDateFilters({
                    ...dateFilters,
                    end_date: event.target.value,
                  })
                }
              />

              <button
                type="button"
                onClick={clearDateFilters}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="cards">
            <div className="card">
              <p>Total Sales</p>
              <h2>{summary.total_sales}</h2>
            </div>

            <div className="card">
              <p>Total Revenue</p>
              <h2>
                {formatCurrency(
                  summary.total_revenue
                )}
              </h2>
            </div>

            <div className="card">
              <p>Total Commission</p>
              <h2>
                {formatCurrency(
                  summary.total_commission
                )}
              </h2>
            </div>

            <div className="card">
              <p>Total Quantity</p>
              <h2>{summary.total_quantity}</h2>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Top Products</h2>
          </div>

          {reportsData.top_products.length === 0 ? (
            <div className="empty-state">
              <h3>No product report data</h3>
            </div>
          ) : (
            <div className="sales-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sales Count</th>
                    <th>Quantity</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {reportsData.top_products.map(
                    (product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>
                          {product.sales_count}
                        </td>
                        <td>{product.quantity}</td>
                        <td>
                          {formatCurrency(
                            product.revenue
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Top Customers</h2>
          </div>

          {reportsData.top_customers.length === 0 ? (
            <div className="empty-state">
              <h3>No customer report data</h3>
            </div>
          ) : (
            <div className="sales-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Sales Count</th>
                    <th>Quantity</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {reportsData.top_customers.map(
                    (customer) => (
                      <tr key={customer.id}>
                        <td>{customer.name}</td>
                        <td>
                          {customer.sales_count}
                        </td>
                        <td>{customer.quantity}</td>
                        <td>
                          {formatCurrency(
                            customer.revenue
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Sales by Salesperson</h2>
          </div>

          {reportsData.by_salesperson.length === 0 ? (
            <div className="empty-state">
              <h3>No salesperson report data</h3>
            </div>
          ) : (
            <div className="sales-table">
              <table>
                <thead>
                  <tr>
                    <th>Salesperson</th>
                    <th>Sales Count</th>
                    <th>Revenue</th>
                    <th>Commission</th>
                  </tr>
                </thead>

                <tbody>
                  {reportsData.by_salesperson.map(
                    (person) => (
                      <tr
                        key={
                          person.id ??
                          person.username
                        }
                      >
                        <td>{person.username}</td>

                        <td>
                          {person.sales_count}
                        </td>

                        <td>
                          {formatCurrency(
                            person.revenue
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            person.commission
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )
  }

  function renderSettings() {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>Settings</h2>
        </div>

        <div className="cards">
          <div className="card">
            <p>Username</p>
            <h2>{user?.username}</h2>
          </div>

          <div className="card">
            <p>Role</p>
            <h2>{user?.role}</h2>
          </div>

          <div className="card">
            <p>Authentication</p>
            <h2>Session</h2>
          </div>

          <div className="card">
            <p>Database</p>
            <h2>PostgreSQL</h2>
          </div>
        </div>
      </div>
    )
  }

  function renderPage() {
    switch (activePage) {
      case 'customers':
        return renderCustomers()

      case 'products':
        return renderProducts()

      case 'sales':
        return renderSales()

      case 'commission':
        return renderCommission()

      case 'reports':
        return renderReports()

      case 'settings':
        return renderSettings()

      case 'dashboard':
      default:
        return renderDashboard()
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <h3>Loading...</h3>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>SalesFlow</h1>
            <p>Sales & Commission ERP</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                value={loginForm.username}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    username: event.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    password: event.target.value,
                  })
                }
                required
              />
            </div>

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button
              className="login-button"
              type="submit"
            >
              Login
            </button>
          </form>

          <div className="login-footer">
            SalesFlow ERP
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>SalesFlow</h2>

        <nav>
          <a
            className={
              activePage === 'dashboard'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActivePage('dashboard')
            }
          >
            Dashboard
          </a>

          <a
            className={
              activePage === 'customers'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActivePage('customers')
            }
          >
            Customers
          </a>

          <a
            className={
              activePage === 'products'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActivePage('products')
            }
          >
            Products
          </a>

          <a
            className={
              activePage === 'sales'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActivePage('sales')
            }
          >
            Sales
          </a>

          <a
            className={
              activePage === 'commission'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActivePage('commission')
            }
          >
            Commission
          </a>

          <a
            className={
              activePage === 'reports'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActivePage('reports')
            }
          >
            Reports
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a
            className={
              activePage === 'settings'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActivePage('settings')
            }
          >
            Settings
          </a>

          <a onClick={handleLogout}>
            Logout
          </a>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>
              {activePage === 'dashboard'
                ? 'Dashboard'
                : activePage.charAt(0).toUpperCase() +
                  activePage.slice(1)}
            </h1>

            <p>
              Welcome back, {user.username}
            </p>
          </div>

          <div className="user">
            <div>
              <strong>{user.username}</strong>
              <small>{user.role}</small>
            </div>

            <div className="avatar">
              {user.username
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </div>

        {renderPage()}
      </main>
    </div>
  )
}

export default App