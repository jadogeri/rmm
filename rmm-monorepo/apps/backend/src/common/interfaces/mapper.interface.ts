export interface IMapper<Entity, Domain> {
  toDomain(entity: Entity): Domain;
  toEntity(domain: Domain): Entity;
}