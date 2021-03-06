
import {from as observableFrom,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import * as uuid from 'uuid/v4';
import { debug } from 'app/utils/logger';
import { IQueryCollection, ExportCollectionState } from 'app/reducers/collection';

// Handling hierarchical data
// https://stackoverflow.com/questions/4048151/what-are-the-options-for-storing-hierarchical-data-in-a-relational-database
@Injectable()
export class QueryCollectionService {

  constructor(
    private storage: StorageService
  ) { }

  create(collection: IQueryCollection) {
    const now = this.storage.now();
    return observableFrom(this.storage.queryCollections.add({ ...collection, created_at: now, updated_at: now }));
  }

  addQuery(collectionId: number, query): Observable<any> {
    const now = this.storage.now();
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
        const uQuery = { ...query, id: uuid() };
        collection.queries.push(uQuery);
        collection.updated_at = now;
      })
    );
  }

  deleteQuery(collectionId: number, query): Observable<any> {
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
        collection.queries = collection.queries.filter(collectionQuery => {
          if (query.id) {
            if (query.id === collectionQuery.id) {
              return false;
            }
          } else {
            // Added for backward compatibility. Initially queries didn't have ids. Remove after a while.
            if (query.windowName === collectionQuery.windowName) {
              return false;
            }
          }

          return true;
        });

        collection.updated_at = this.storage.now();
      })
    );
  }

  deleteCollection(collectionId: number) {
    return observableFrom(this.storage.queryCollections.delete(collectionId));
  }

  updateCollection(collectionId: number, modifiedCollection: IQueryCollection) {
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify((collection, ctx) => {
        debug.log('We update.');
        ctx.value = modifiedCollection;
        ctx.value.updated_at = this.storage.now();
      })
    );
  }

  getExportCollectionData(collectionId: number) {
    return observableFrom(
      this.storage.queryCollections.get({ id: collectionId }).then(collection => {
        const exportCollectionData: ExportCollectionState = {
          version: 1,
          type: 'collection',
          ...collection
        };

        return exportCollectionData;
      })
    );
  }

  importCollectionDataFromJson(data: string) {
    if (!data) {
      throw new Error('String is empty.');
    }

    try {
      return this.importCollectionData(JSON.parse(data));
    } catch (err) {
      debug.log('The file is invalid.', err);
    }
  }

  importCollectionData(data: ExportCollectionState) {
    try {
      // Verify file's content
      if (!data) {
        throw new Error('Object is empty.');
      }
      if (!data.version || !data.type || data.type !== 'collection') {
        throw new Error('File is not a valid Altair collection file.');
      }

      return this.create({
        title: data.title,
        collections: data.collections,
        description: data.description,
        queries: data.queries,
      })
    } catch (err) {
      debug.log('Something went wrong while importing the data.', err);
    }
  }

  getAll() {
    return observableFrom(this.storage.queryCollections.toArray());
  }

}
