-- 顧客テーブルの作成
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL UNIQUE CHECK (contact <> ''),
    location VARCHAR(255) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 案件テーブルの作成
CREATE TABLE cases (
    case_id SERIAL PRIMARY KEY,
    case_name VARCHAR(255) NOT NULL,
    case_status VARCHAR(255) NOT NULL CHECK (case_status IN ('新規', '交渉中', '契約締結', '失注')),
    expected_revenue DECIMAL(10, 2) CHECK (expected_revenue >= 0),
    representative VARCHAR(255) NOT NULL,
    customer_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 商談履歴テーブルの作成
CREATE TABLE negotiations (
    negotiation_id SERIAL PRIMARY KEY,
    negotiation_date DATE NOT NULL,
    negotiation_content TEXT NOT NULL,
    negotiation_confidence DECIMAL(3, 2) NOT NULL CHECK (negotiation_confidence BETWEEN 0 AND 1),
    negotiation_representative VARCHAR(255) NOT NULL,
    case_id INT NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 関数の作成
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;   
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_customers_updated_date BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_date();
CREATE TRIGGER update_cases_updated_date BEFORE UPDATE ON cases FOR EACH ROW EXECUTE PROCEDURE update_updated_date();
CREATE TRIGGER update_negotiations_updated_date BEFORE UPDATE ON negotiations FOR EACH ROW EXECUTE PROCEDURE update_updated_date();