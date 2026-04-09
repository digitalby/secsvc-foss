import {
  ItemCategory,
  ItemFieldType,
  type Item,
  type ItemCreateParams,
  type ItemField,
} from "@1password/sdk";
import type { ConnectItem, ConnectField } from "@/types/connect";

export function toItemCreateParams(connect: ConnectItem): ItemCreateParams {
  return {
    category: ItemCategory.Login,
    vaultId: connect.vault.id,
    title: connect.title,
    tags: connect.tags,
    fields: connect.fields.map(toSdkField),
  };
}

export function toItemUpdate(connect: ConnectItem, existing: Item): Item {
  return {
    ...existing,
    title: connect.title,
    tags: connect.tags,
    fields: connect.fields.map(toSdkField),
  };
}

export function toConnectItem(item: Item): ConnectItem {
  return {
    id: item.id,
    title: item.title,
    category: "LOGIN",
    vault: { id: item.vaultId },
    tags: item.tags,
    fields: item.fields.map(toConnectField),
  };
}

function toSdkField(f: ConnectField): ItemField {
  return {
    id: f.id,
    title: f.label,
    fieldType:
      f.type === "CONCEALED" ? ItemFieldType.Concealed : ItemFieldType.Text,
    value: f.value,
  };
}

function toConnectField(f: ItemField): ConnectField {
  return {
    id: f.id,
    label: f.title,
    value: f.value,
    type: f.fieldType === ItemFieldType.Concealed ? "CONCEALED" : "STRING",
  };
}
