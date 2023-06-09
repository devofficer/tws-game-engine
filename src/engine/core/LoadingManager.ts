import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LoadingTrackerEntry } from './LoadingTrackerEntry';
import { UIManager } from './UIManager';
import { Scenario } from '../world/Scenario';
import Swal from 'sweetalert2';
import { World } from '../world/World';
import { WorldEvent } from '../enums/WorldEvent';

export class LoadingManager {
  public firstLoad = true;
  public onFinishedCallback: () => void;

  private world: World;
  private gltfLoader: GLTFLoader;
  private loadingTracker: LoadingTrackerEntry[] = [];

  constructor(world: World) {
    this.world = world;
    this.gltfLoader = new GLTFLoader();

    this.world.setTimeScale(0);
  }

  public loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void {
    const trackerEntry = this.addLoadingEntry(path);

    this.gltfLoader.load(
      path,
      (gltf) => {
        onLoadingFinished(gltf);
        this.doneLoading(trackerEntry);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          trackerEntry.progress = xhr.loaded / xhr.total;
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  public addLoadingEntry(path: string): LoadingTrackerEntry {
    const entry = new LoadingTrackerEntry(path);
    this.loadingTracker.push(entry);

    return entry;
  }

  public doneLoading(trackerEntry: LoadingTrackerEntry): void {
    trackerEntry.finished = true;
    trackerEntry.progress = 1;

    if (this.isLoadingDone()) {
      if (this.onFinishedCallback !== undefined) {
        this.onFinishedCallback();
      }
    }
  }

  public createWelcomeScreenCallback(scenario: Scenario): void {
    if (this.onFinishedCallback === undefined) {
      this.onFinishedCallback = () => {
        this.world.update(1, 1);
      };
    }
  }

  private getLoadingPercentage(): number {
    let total = 0;
    let finished = 0;

    for (const item of this.loadingTracker) {
      total++;
      finished += item.progress;
    }

    return (finished / total) * 100;
  }

  private isLoadingDone(): boolean {
    for (const entry of this.loadingTracker) {
      if (!entry.finished) return false;
    }
    return true;
  }
}
