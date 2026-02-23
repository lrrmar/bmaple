export type AbstractConstructor<T = unknown> = abstract new (
  ...args: any[]
) => T;

export function isSubclassOf<
  Child extends AbstractConstructor,
  Parent extends AbstractConstructor,
>(child: Child, parent: Parent): child is Child & Parent {
  let current = Object.getPrototypeOf(child);

  while (current) {
    if (current === parent) return true;
    current = Object.getPrototypeOf(current);
  }

  return false;
}
