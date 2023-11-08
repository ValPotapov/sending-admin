import React from "react";
import { Row, Typography, Select, Modal, DatePicker } from "antd";

const { Title } = Typography;
const { RangePicker } = DatePicker;
export const FilterModal = ({
    isModalOpen,
    handleOk,
    handleCancel,
    columns,
}) => {
    return (
        <Modal
            style={{ maxWidth: 450 }}
            title={
                <Title
                    level={2}
                    style={{
                        fontWeight: "700",
                        marginBottom: "0",
                        marginTop: 0,
                    }}
                >
                    Фильтры
                </Title>
            }
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
        >
            <p>Дата создания</p>
            <RangePicker style={{ width: "100%" }} />
            <Row
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <div style={{ maxWidth: 190, width: "100%" }}>
                    <p>Перевозчик</p>
                    <Select
                        style={{
                            maxWidth: "190px",
                            width: "100%",
                        }}
                        placeholder="Сортировка"
                        optionFilterProp="children"
                        options={columns.map((item) => {
                            return {
                                title: item.dataIndex,
                                value: item.title,
                            };
                        })}
                    />
                </div>
                <div style={{ maxWidth: 190, width: "100%" }}>
                    <p>Статус</p>
                    <Select
                        style={{
                            maxWidth: "190px",
                            width: "100%",
                        }}
                        placeholder="Сортировка"
                        optionFilterProp="children"
                        options={columns.map((item) => {
                            return item.title !== ""
                                ? {
                                      title: item.dataIndex,
                                      value: item.title,
                                  }
                                : {};
                        })}
                    />
                </div>
            </Row>
            <p>Дата отправки</p>
            <RangePicker style={{ width: "100%" }} />
            <p>Дата прибытия</p>
            <RangePicker style={{ width: "100%" }} />
        </Modal>
    );
};
